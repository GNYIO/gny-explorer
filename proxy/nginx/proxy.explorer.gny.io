
server {
   server_name proxy.explorer.gny.io;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60;
        proxy_read_timeout 600;
        proxy_send_timeout 600;
    }


    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/proxy.explorer.gny.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/proxy.explorer.gny.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = proxy.explorer.gny.io) {
        return 301 https://$host$request_uri;
    }


    listen 80 ;
    listen [::]:80 ;
    server_name proxy.explorer.gny.io;
    return 404;
}
