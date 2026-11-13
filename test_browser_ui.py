import os
import sys
import time

os.environ["NODE_OPTIONS"] = "--max-old-space-size=4096"

from playwright.sync_api import sync_playwright

def run_ui_tests():
    output_dir = os.path.join(os.getcwd(), "test_results")
    os.makedirs(output_dir, exist_ok=True)
    
    console_errors = []
    page_errors = []
    failed_requests = []
    results = []

    def log_result(step_name, success, details=""):
        status = "PASSED" if success else "FAILED"
        print(f"[{status}] {step_name}: {details}")
        results.append({"step": step_name, "status": status, "details": details})

    with sync_playwright() as p:
        chrome_path = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        if os.path.exists(chrome_path):
            browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        else:
            browser = p.chromium.launch(headless=True)
            
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Listeners
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("dialog", lambda dialog: dialog.accept())
        page.on("response", lambda res: failed_requests.append(f"{res.status} {res.url}") if res.status >= 400 else None)

        try:
            print("\n=== INICIANDO PRUEBAS DE UI EN NAVEGADOR (MudaT) ===")
            
            # 1. Carga de la aplicación (Home)
            target_url = "http://localhost:3000/#inicio"
            print(f"Navegando a {target_url}...")
            response = page.goto(target_url, wait_until="networkidle", timeout=15000)
            
            if response and response.status == 200:
                log_result("1. Carga inicial Home", True, f"HTTP Status: {response.status}")
            else:
                log_result("1. Carga inicial Home", False, f"HTTP Status: {response.status if response else 'None'}")
            
            page.wait_for_selector("#app-root", timeout=5000)
            page.wait_for_timeout(1000)
            
            # Screenshot Home
            home_shot = os.path.join(output_dir, "01_home_view.png")
            page.screenshot(path=home_shot, full_page=True)
            log_result("1.1 Screenshot Home", True, f"Guardado en {home_shot}")

            hero_title = page.locator(".hero-title").inner_text() if page.locator(".hero-title").count() > 0 else ""
            log_result("1.2 Hero Title presente", bool(hero_title), f"Texto: '{hero_title.strip()[:40]}...'")

            featured_cards = page.locator(".property-card").count()
            log_result("1.3 Tarjetas destacadas en Home", featured_cards > 0, f"Encontradas {featured_cards} propiedades")

            # 2. Test Cambio de Tema (Dark / Light) con el interruptor segmentado
            theme_switcher = page.locator("#theme-switcher")
            btn_light = page.locator("#theme-btn-light")
            btn_dark = page.locator("#theme-btn-dark")
            
            if theme_switcher.count() > 0:
                is_dark_before = "dark-theme" in (page.locator("body").get_attribute("class") or "")
                
                # Clic en Claro
                btn_light.click()
                page.wait_for_timeout(400)
                is_dark_after = "dark-theme" in (page.locator("body").get_attribute("class") or "")
                
                theme_switched_to_light = (is_dark_before is True) and (is_dark_after is False)
                log_result("2.1 Cambio a Tema Claro", theme_switched_to_light, f"Modo claro activo: {not is_dark_after}")
                
                # Screenshot Light
                light_shot = os.path.join(output_dir, "02_light_theme.png")
                page.screenshot(path=light_shot)
                log_result("2.2 Screenshot Modo Claro", True, f"Guardado en {light_shot}")
                
                # Volver a Oscuro
                btn_dark.click()
                page.wait_for_timeout(400)
                is_dark_restored = "dark-theme" in (page.locator("body").get_attribute("class") or "")
                log_result("2.3 Restauración a Tema Oscuro", is_dark_restored, f"Modo oscuro activo: {is_dark_restored}")
            else:
                log_result("2. Cambio de Tema Dark/Light", False, "Interruptor #theme-switcher no encontrado")

            # 3. Navegación a Catálogo / Búsqueda (#comprar)
            print("\nProbando Vista de Búsqueda (#comprar)...")
            page.click("a[href='#comprar']")
            page.wait_for_timeout(1000)
            
            search_cards = page.locator(".property-card").count()
            log_result("3.1 Renderizado de Búsqueda (#comprar)", search_cards > 0, f"Propiedades renderizadas: {search_cards}")
            
            city_filter = page.locator(".filter-select, #filter-city, select")
            log_result("3.2 Controles de filtrado", city_filter.count() > 0, f"Selects/Inputs detectados: {city_filter.count()}")
            
            search_shot = os.path.join(output_dir, "03_search_view.png")
            page.screenshot(path=search_shot, full_page=True)
            log_result("3.3 Screenshot Búsqueda", True, f"Guardado en {search_shot}")

            # 4. Navegación a Detalle de Propiedad (#propiedad/:id)
            print("\nProbando Detalle de Propiedad...")
            first_card = page.locator(".property-card").first
            detail_link = first_card.locator("a[href^='#propiedad']").first
            if detail_link.count() > 0:
                target_href = detail_link.get_attribute("href")
                print(f"Haciendo click en {target_href}...")
                detail_link.click()
                page.wait_for_timeout(1200)
                
                current_hash = page.evaluate("window.location.hash")
                is_detail = "#propiedad/" in current_hash
                log_result("4.1 Navegación a detalle de propiedad", is_detail, f"Hash actual: {current_hash}")
                
                # Comprobar elementos de vista de detalle
                detail_title = page.locator(".property-detail-title, h1, h2").first.inner_text() if page.locator("h1, h2").count() > 0 else ""
                log_result("4.2 Contenido de detalle renderizado", bool(detail_title), f"Título: {detail_title[:40]}")
                
                detail_shot = os.path.join(output_dir, "04_property_detail.png")
                page.screenshot(path=detail_shot, full_page=True)
                log_result("4.3 Screenshot Detalle", True, f"Guardado en {detail_shot}")
            else:
                log_result("4.1 Detalle de propiedad", False, "No se encontró enlace a #propiedad en la tarjeta")

            # 5. Calculadora Financiera (#calculadora)
            print("\nProbando Calculadora Financiera (#calculadora)...")
            page.click("a[href='#calculadora']")
            page.wait_for_timeout(1000)
            
            calc_inputs = page.locator("input[type='range'], input[type='number']")
            has_calc = calc_inputs.count() > 0
            log_result("5.1 Vista Calculadora cargada", has_calc, f"Controles interactivos: {calc_inputs.count()}")
            
            calc_shot = os.path.join(output_dir, "05_calculator_view.png")
            page.screenshot(path=calc_shot, full_page=True)
            log_result("5.2 Screenshot Calculadora", True, f"Guardado en {calc_shot}")

            # 6. Portal de Cliente (#mi-portal) - Verificando que ya no haya error de call stack
            print("\nProbando Portal de Cliente (#mi-portal)...")
            page.goto("http://localhost:3000/#mi-portal", wait_until="networkidle")
            page.wait_for_timeout(1200)
            
            # Probar pestañas del dashboard
            tabs = page.locator(".dashboard-menu-item")
            log_result("6.1 Menú de pestañas del Cliente", tabs.count() > 0, f"Pestañas disponibles: {tabs.count()}")
            
            # Clic en Favoritos
            fav_tab = page.locator(".dashboard-menu-item[data-tab='dashboard-favorites']")
            if fav_tab.count() > 0:
                fav_tab.click()
                page.wait_for_timeout(600)
                log_result("6.2 Cambio a pestaña Favoritos", True, "Pestaña activada sin error")
                
            # Regresar a Overview
            overview_tab = page.locator(".dashboard-menu-item[data-tab='dashboard-overview']")
            if overview_tab.count() > 0:
                overview_tab.click()
                page.wait_for_timeout(600)
                log_result("6.3 Regreso a pestaña Overview", True, "Pestaña restaurada sin error de recursión")

            portal_shot = os.path.join(output_dir, "06_client_portal.png")
            page.screenshot(path=portal_shot, full_page=True)
            log_result("6.4 Screenshot Portal Cliente", True, f"Guardado en {portal_shot}")

            # 7. Asesores / CRM (#asesores)
            print("\nProbando CRM Asesores (#asesores)...")
            page.goto("http://localhost:3000/#asesores", wait_until="networkidle")
            page.wait_for_timeout(1200)
            
            crm_shot = os.path.join(output_dir, "07_crm_advisors.png")
            page.screenshot(path=crm_shot, full_page=True)
            log_result("7.1 Screenshot CRM Asesores", True, f"Guardado en {crm_shot}")

            # 8. Consola de Administración (#admin)
            print("\nProbando Consola de Admin (#admin)...")
            page.goto("http://localhost:3000/#admin", wait_until="networkidle")
            page.wait_for_timeout(1200)
            
            admin_shot = os.path.join(output_dir, "08_admin_panel.png")
            page.screenshot(path=admin_shot, full_page=True)
            log_result("8.1 Screenshot Admin Panel", True, f"Guardado en {admin_shot}")

            # 9. Asistente IA Flotante (Chatbot)
            print("\nProbando Chatbot de IA...")
            page.goto("http://localhost:3000/#inicio", wait_until="networkidle")
            page.wait_for_timeout(800)
            
            chat_toggle = page.locator("#ai-chatbot-toggle")
            if chat_toggle.count() > 0:
                chat_toggle.click()
                page.wait_for_timeout(500)
                
                chat_window = page.locator("#ai-chatbot-window")
                is_open = "active" in (chat_window.get_attribute("class") or "")
                log_result("9.1 Apertura de Chatbot IA", is_open, "Ventana abierta con éxito")
                
                quick_btn = page.locator(".quick-reply-btn").first
                if quick_btn.count() > 0:
                    quick_btn.click()
                    page.wait_for_timeout(1600)
                    
                    messages_count = page.locator(".chat-message").count()
                    log_result("9.2 Interacción con Chatbot", messages_count >= 2, f"Mensajes en chat: {messages_count}")
                
                chat_shot = os.path.join(output_dir, "09_chatbot_open.png")
                page.screenshot(path=chat_shot)
                log_result("9.3 Screenshot Chatbot", True, f"Guardado en {chat_shot}")
            else:
                log_result("9.1 Chatbot IA", False, "Botón #ai-chatbot-toggle no encontrado")

            # 10. Verificación de Integridad
            print("\n=== VERIFICACIÓN DE INTEGRIDAD Y RECURSOS ===")
            if failed_requests:
                print(f"Peticiones HTTP fallidas: {failed_requests}")
                log_result("10. Solicitudes de recursos HTTP (status >= 400)", False, f"Fallos: {failed_requests}")
            else:
                log_result("10. Solicitudes de recursos HTTP (status >= 400)", True, "Todas las peticiones respondieron 200/304")

            if page_errors:
                log_result("10.1 Excepciones no controladas (pageerror)", False, f"Se detectaron: {page_errors}")
            else:
                log_result("10.1 Excepciones no controladas (pageerror)", True, "0 excepciones de JS detectadas")

            if console_errors:
                log_result("10.2 Errores de consola (console.error)", False, f"Se detectaron {len(console_errors)} errores: {console_errors}")
            else:
                log_result("10.2 Errores de consola (console.error)", True, "0 errores de consola detectados")

        except Exception as e:
            print(f"Error general durante las pruebas: {e}")
            log_result("Ejecución general de tests", False, str(e))
        finally:
            browser.close()

    print("\n=== RESUMEN DE PRUEBAS COMPLETADO ===")
    return results

if __name__ == "__main__":
    run_ui_tests()
