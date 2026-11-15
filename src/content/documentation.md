# Documentation

## How it works

Command DNS sits on your local network segment, next to your workstations and servers.

1. A device on your network needs to resolve a name and sends a query to Command DNS.
2. If the name belongs to a local record, Command DNS answers immediately.
3. If the answer is already in the cache, it is served from the cache.
4. Otherwise the query is forwarded to an upstream resolver on the Internet, and the answer is cached for next time.

Most traffic stays between your devices and the DNS server. Only a small share of queries ever needs the Internet.

## Getting started

1. **Install** Command DNS on a machine that stays on, on the network you want to serve. See the [Download](/download) page.
2. **Open the administration GUI** and choose your upstream resolvers.
3. **Add local records** for the devices and services you want to reach by name.
4. **Point your devices at it** — set Command DNS as the DNS server in your router's DHCP settings, or on individual devices.

## Concepts

| Term | Meaning |
| --- | --- |
| Local record | A name you define that resolves to an address on your network |
| Cache | Recently resolved answers kept locally for fast repeat lookups |
| Upstream resolver | The Internet DNS service that answers names Command DNS does not know |

## Tips

- Give the machine running Command DNS a fixed IP address so devices can always find it.
- Keep a secondary DNS server configured only if you are comfortable with some queries bypassing Command DNS.
