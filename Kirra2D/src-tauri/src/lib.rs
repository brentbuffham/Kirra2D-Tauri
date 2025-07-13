 use tauri::{command, generate_handler, Builder};

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
fn close_app() {
    println!("🚪 Force quitting application");
    std::process::exit(0);
}

pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(generate_handler![greet, close_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}