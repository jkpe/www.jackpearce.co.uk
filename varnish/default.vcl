vcl 4.0;

backend default {
    .host = "ghost-app:2368";
}
sub vcl_recv {
    # Do not cache the admin and preview pages
    if (req.url ~ "/(admin|p|ghost)/") {
           return (pass);
    }
}
sub vcl_backend_response {
    if (beresp.http.content-type ~ "text/plain|text/css|application/json|application/x-javascript|text/xml|application/xml|application/xml+rss|text/javascript") {
        set beresp.do_gzip = true;
        set beresp.http.cache-control = "public, max-age=1209600";
    }
}
