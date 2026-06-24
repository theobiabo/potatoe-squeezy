# Potatoe Squeezy Release Ping Action

Posts release metadata to Potatoe Squeezy and returns the creator tip page from the API response.

```yaml
name: Release support ping

on:
  release:
    types: [published]

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - uses: potatoe-squeezy/action@v1
        with:
          platform-url: https://api.potatosqueezy.xyz
          token: ${{ secrets.POTATOE_TOKEN }}
          message: ${{ github.event.release.tag_name }} shipped - support the work.
```

The token must be a Potatoe Squeezy bearer token for the creator account.
