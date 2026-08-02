def paginate(items: list, page: int, page_size: int) -> dict:
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        'items': items[start:end],
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': (total + page_size - 1) // page_size,
        }
    }


def paginate_query(db, query: str, params: tuple, page: int, page_size: int, count_query: str = None):
    if count_query:
        total = db.execute(count_query, params).fetchone()[0]
    else:
        total_rows = db.execute(query, params).fetchall()
        total = len(total_rows)

    offset = (page - 1) * page_size
    paged_query = f"{query} LIMIT ? OFFSET ?"
    rows = db.execute(paged_query, params + (page_size, offset)).fetchall()
    return {
        'items': [dict(r) for r in rows],
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': (total + page_size - 1) // page_size,
        }
    }
