//! Gateway WebSocket client for communicating with Moltbot Gateway

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::{mpsc, Mutex, RwLock};
use tokio_tungstenite::{connect_async, tungstenite::Message as WsMessage};
use url::Url;
use uuid::Uuid;

/// Connection state managed by Tauri
#[derive(Default)]
pub struct GatewayState {
    connected: RwLock<bool>,
    sender: Mutex<Option<mpsc::Sender<String>>>,
}

/// Request to send to Gateway
#[derive(Debug, Serialize)]
struct GatewayRequest {
    id: String,
    method: String,
    params: serde_json::Value,
}

/// Chat message parameters
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatParams {
    pub message: String,
    pub session_key: Option<String>,
    pub model: Option<String>,
    pub thinking: Option<String>,
}

/// Stream chunk from Gateway
#[derive(Debug, Deserialize, Clone)]
pub struct StreamChunk {
    #[serde(rename = "requestId")]
    pub request_id: Option<String>,
    pub content: Option<String>,
    pub done: Option<bool>,
    #[serde(rename = "type")]
    pub msg_type: Option<String>,
}

/// Response from Gateway
#[derive(Debug, Deserialize, Clone)]
pub struct GatewayResponse {
    pub id: Option<String>,
    pub result: Option<serde_json::Value>,
    pub error: Option<GatewayError>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct GatewayError {
    pub code: i32,
    pub message: String,
}

/// Connect to Moltbot Gateway
#[tauri::command]
pub async fn connect(
    app: AppHandle,
    state: State<'_, GatewayState>,
    url: String,
    token: String,
) -> Result<bool, String> {
    // Build WebSocket URL with auth
    let ws_url = format!("{}?token={}", url, token);
    let url = Url::parse(&ws_url).map_err(|e| e.to_string())?;

    // Connect to WebSocket
    let (ws_stream, _) = connect_async(url)
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    let (mut write, mut read) = ws_stream.split();

    // Create channel for sending messages
    let (tx, mut rx) = mpsc::channel::<String>(100);

    // Store sender
    *state.sender.lock().await = Some(tx);
    *state.connected.write().await = true;

    // Emit connection event
    let _ = app.emit("gateway:connected", ());

    // Spawn task to handle outgoing messages
    let app_clone = app.clone();
    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if let Err(e) = write.send(WsMessage::Text(msg)).await {
                eprintln!("Failed to send message: {}", e);
                let _ = app_clone.emit("gateway:error", e.to_string());
                break;
            }
        }
    });

    // Spawn task to handle incoming messages
    let app_clone = app.clone();
    tokio::spawn(async move {
        while let Some(msg) = read.next().await {
            match msg {
                Ok(WsMessage::Text(text)) => {
                    // Try to parse as stream chunk or response
                    if let Ok(chunk) = serde_json::from_str::<StreamChunk>(&text) {
                        if let Some(content) = &chunk.content {
                            let _ = app_clone.emit("gateway:stream", content.clone());
                        }
                        if chunk.done == Some(true) {
                            let _ = app_clone.emit("gateway:complete", ());
                        }
                    } else if let Ok(response) = serde_json::from_str::<GatewayResponse>(&text) {
                        let _ = app_clone.emit("gateway:response", response);
                    } else {
                        // Raw message
                        let _ = app_clone.emit("gateway:message", text);
                    }
                }
                Ok(WsMessage::Close(_)) => {
                    let _ = app_clone.emit("gateway:disconnected", ());
                    break;
                }
                Err(e) => {
                    let _ = app_clone.emit("gateway:error", e.to_string());
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(true)
}

/// Disconnect from Gateway
#[tauri::command]
pub async fn disconnect(state: State<'_, GatewayState>) -> Result<(), String> {
    *state.sender.lock().await = None;
    *state.connected.write().await = false;
    Ok(())
}

/// Send a chat message to Gateway
#[tauri::command]
pub async fn send_message(
    state: State<'_, GatewayState>,
    params: ChatParams,
) -> Result<String, String> {
    let sender = state.sender.lock().await;
    let sender = sender.as_ref().ok_or("Not connected")?;

    let request_id = Uuid::new_v4().to_string();

    let request = GatewayRequest {
        id: request_id.clone(),
        method: "chat.send".to_string(),
        params: serde_json::json!({
            "message": params.message,
            "sessionKey": params.session_key,
            "model": params.model,
            "thinking": params.thinking,
        }),
    };

    let json = serde_json::to_string(&request).map_err(|e| e.to_string())?;
    sender.send(json).await.map_err(|e| e.to_string())?;

    Ok(request_id)
}

/// Get connection status
#[tauri::command]
pub async fn get_connection_status(state: State<'_, GatewayState>) -> Result<bool, String> {
    Ok(*state.connected.read().await)
}
