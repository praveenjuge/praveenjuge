---
title: 'Exploring FreshRSS and Fly.io: A Designer''s Perspective'
description: 'Today, I want to share my experience with two fantastic tools: FreshRSS and Fly.io. As a designer and not a backend nerd, these platforms have impressed me with their ease of use and outstanding UI/UX. Let''s dive in!'
publishedAt: '2024-06-23T15:51:38.355Z'
---

### FreshRSS: The Ultimate RSS Solution

[FreshRSS](https://freshrss.org) is a web-based RSS reader that you can deploy anywhere using Docker. It's free, easy to deploy, and boasts one of the best UIs for reading your favorite content. Initially, I thought the UI could use some improvement, but after using it, I realized it has the perfect balance for its purpose. The interface is dense yet scannable, making it easy to go through your RSS feeds one by one. Here are some highlights:

- **Keyboard Shortcuts:** Navigating through feeds is a breeze.
- **Dark Mode:** Perfect for night-time reading.
- **Subscription Management:** Easily manage and organize your RSS feeds with labels and favorites.
- **Views:** Multiple views for reading feeds and managing subscriptions.

FreshRSS may not have the flashiest UI, but its UX is top-notch, making it the best RSS reader I've used.

### Fly.io: Deploy Anything, Anywhere

[Fly.io](https://fly.io) is a deployment platform similar to Heroku and DigitalOcean, but with a unique twist. It offers a sleek, modern UI combined with a terminal-based approach for control, giving you the best of both worlds. Here's how easy it is to deploy an app on Fly.io:

1. **Create an Account:** Sign up on Fly.io.
2. **Login:** Use your Mac terminal to log in.
3. **Create a fly.toml File:** Specify your Docker file, RAM, storage, and more.

Here's an example of my `fly.toml` configuration for FreshRSS:

```toml
app = 'praveenjuge-freshrss'
kill_signal = 'SIGINT'
kill_timeout = '5s'

[experimental]
  auto_rollback = true

[build]
  image = 'freshrss/freshrss'

[env]
  CRON_MIN = '*/20'

[[mounts]]
  source = 'freshrss_data'
  destination = '/var/www/FreshRSS/data'

[[services]]
  protocol = 'tcp'
  internal_port = 80
  processes = ['app']

[[services.ports]]
    port = 80
    handlers = ['http']
    force_https = true

[[services.ports]]
    port = 443
    handlers = ['tls', 'http']

  [services.concurrency]
    type = 'connections'
    hard_limit = 25
    soft_limit = 20

[[services.tcp_checks]]
    interval = '15s'
    timeout = '2s'
    grace_period = '1s'

[[vm]]
  size = 'shared-cpu-1x'
```

After creating this file, deploying your app is as simple as running a deploy command. The combination of a clean UI and powerful terminal commands makes Fly.io an excellent choice for deploying applications.

### Final Thoughts

As a designer, I prioritize good UI and UX. Fly.io has both in spades, with an intuitive interface and seamless functionality. FreshRSS, while not the flashiest, provides an excellent user experience with all the features you need in an RSS reader. Both tools have earned a place in my workflow, and I highly recommend them.

Got any thoughts? Share them with me on [Twitter](https://twitter.com/praveenjuge).