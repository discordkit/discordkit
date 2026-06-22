#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // The shell plugin spawns the Discord sidecar and pumps its stdio; kkrpc
    // (in @discordkit/tauri) frames the RPC over it. This is the only Rust the
    // adapter needs — there is no discordkit-specific crate.
    .plugin(tauri_plugin_shell::init())
    // OS credential vault for persisting the Discord session tokens; the webview
    // relays the sidecar's token-store calls to it (see src/discord.ts).
    .plugin(tauri_plugin_keyring::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
