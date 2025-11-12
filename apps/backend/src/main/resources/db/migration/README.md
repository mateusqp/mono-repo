# Database Migrations

## Naming Convention

Use timestamp-based versioning for better team collaboration:

```
V{YYYYMMDDHHMMSS}__{description}.sql
```

### Examples:
- `V20250101000000__create_user_table.sql`
- `V20250115143000__add_user_phone_column.sql`
- `V20250120091500__create_product_table.sql`

### Why Timestamps?

✅ **No conflicts**: Each developer generates unique timestamps
✅ **Chronological order**: Clear migration history
✅ **Merge friendly**: No version number collisions in Git
✅ **Production safe**: Migrations run in timestamp order

### Best Practices:

1. Use current timestamp when creating migration
2. Never modify executed migrations
3. Use descriptive names after the timestamp
4. Keep migrations small and focused
5. Test migrations on local database first

### Generating Timestamp:

**Linux/Mac:**
```bash
date +%Y%m%d%H%M%S
```

**Windows PowerShell:**
```powershell
Get-Date -Format "yyyyMMddHHmmss"
```

**Manual:**
Format: YYYYMMDDHHmmss (Year Month Day Hour Minute Second)
Example: 20250115143000 = January 15, 2025, 14:30:00
