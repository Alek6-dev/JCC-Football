import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <title>JCC Football</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0D1622" />
        <meta name="application-name" content="JCC Football" />
        <meta name="apple-mobile-web-app-title" content="JCC Football" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <style dangerouslySetInnerHTML={{ __html: `
          html,
          body,
          #root,
          body > div:first-child {
            width: 100%;
            height: 100%;
            min-height: 100%;
            margin: 0;
            background: #EDF1F8;
            overscroll-behavior: none;
          }
          html {
            height: -webkit-fill-available;
          }
          body {
            position: fixed;
            inset: 0;
            min-height: 100dvh;
            min-height: -webkit-fill-available;
            overflow-x: hidden;
            overflow-y: hidden;
            -webkit-text-size-adjust: 100%;
            touch-action: manipulation;
          }
          #root,
          body > div:first-child {
            min-height: 100dvh;
            min-height: -webkit-fill-available;
          }
        `}} />
        <ScrollViewStyleReset />
        {/* Fix iOS PWA : remplace pushState pour éviter la barre de navigation Safari */}
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.navigator.standalone) {
            history.pushState = function(s, t, u) {
              return history.replaceState(s, t, u);
            };

            document.addEventListener('click', function(event) {
              var target = event.target;
              while (target && target.tagName !== 'A') {
                target = target.parentElement;
              }
              if (!target || !target.href) return;

              var url = new URL(target.href, window.location.href);
              if (url.origin !== window.location.origin) return;

              event.preventDefault();
              history.replaceState(null, '', url.pathname + url.search + url.hash);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }, true);
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
