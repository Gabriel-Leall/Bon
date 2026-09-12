// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(feature = "export-bindings")]
fn main() {
    bon_lib::export_ts_bindings();
    println!("✓ TypeScript bindings exported to ../src/lib/bindings.ts");
}

#[cfg(not(feature = "export-bindings"))]
fn main() {
    bon_lib::run()
}
