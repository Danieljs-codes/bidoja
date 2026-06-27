# bidoja

## Development

```bash
vp ready              # check, test, build all packages
vp dev                # run website dev server
vp run create-package # scaffold a new internal package
vp run db:generate    # generate database migrations
vp run db:migrate     # run database migrations
vp run db:push        # push database schema
vp run db:up          # start database studio
```

## Packages

| Package             | Description                   |
| ------------------- | ----------------------------- |
| `apps/website`      | Web application               |
| `packages/auth`     | Authentication                |
| `packages/database` | Database schema and relations |

Built with [Vite+](https://viteplus.dev), [Effect](https://effect.website), TypeScript.
