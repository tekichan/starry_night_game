/**
 * Default Service Worker Path
 */
export const SERVICE_WORKER_PATH = './service-worker.js';

/**
 * Start PWA Service Worker
 * @author Teki Chan
 * @since 14 May 2020
 * @see https://webpack.js.org/guides/progressive-web-application/
 */
export function start_pwa_worker(service_worker_path=SERVICE_WORKER_PATH) {
    if ('serviceWorker' in navigator) {
        window.addEventListener(
            'load'
            , () => {
                navigator.serviceWorker.register(service_worker_path).then(
                    registration => {
                        console.log('SW registered: ', registration);
                    }
                ).catch(
                    registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    }
                );
            }
        );
    }    
}