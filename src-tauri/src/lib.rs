//! Molt Client - Native Moltbot Client
//! 
//! Rust backend handling WebSocket communication with Moltbot Gateway

mod gateway;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        #[cfg(not(any(target_os = "android", target_os = "ios")))]
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            // Initialize gateway state
            app.manage(gateway::GatewayState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            gateway::connect,
            gateway::disconnect,
            gateway::send_message,
            gateway::get_connection_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
