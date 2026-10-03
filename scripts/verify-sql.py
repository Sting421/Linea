"""Install pglast as a development check dependency to parse PostgreSQL syntax.
Parsing does not prove RLS behavior or migration execution in Supabase.
"""

from pathlib import Path

from pglast import parse_sql

for file in Path("supabase").rglob("*.sql"):
    statements = parse_sql(file.read_text(encoding="utf-8"))
    print(f"{file}: {len(statements)} statements parsed")
