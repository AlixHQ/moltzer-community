//! Molt Client - Native Moltbot Client
//! 
//! Rust backend handling WebSocket communication with Moltbot Gateway

mod gateway;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init());

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_window_state::Builder::new().build());
    }

    builder
        .setup(|app| {
            use tauri::Manager;
            app.manage(gateway::GatewayState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            gateway::connect,
            gateway::disconnect,
            gateway::send_message,
            gateway::get_connection_status,
            gateway::get_models,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
