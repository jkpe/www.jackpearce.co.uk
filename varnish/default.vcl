vcl 4.1;

acl purge {
  "ghost";
  "127.0.0.1";
}

sub vcl_recv {
  if (req.url ~ "/rebuild/purge") {
    if (client.ip !~ purge) {
      return (synth(405, "Method Not Allowed"));
    }
    ban("req.http.host == www.jackpearce.co.uk");
    return(synth(200, "Cache cleared"));
  }
}

backend default {
    .host = "ghost:2368";
}

sub vcl_recv {
    # Do not cache the admin and preview pages
    if (req.url ~ "/(admin|p|ghost)/") {
           return (pass);
    }
}
