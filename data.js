var tables = [{
    "name": "user",
    "x": 104,
    "y": 85,
    "columns": [{
        "name": "id",
        "type": "int",
        "attribute": "primary"
    }, {
        "name": "username",
        "type": "varchar(64)"
    }, {
        "name": "password",
        "type": "varchar(64)"
    }]
}, {
    "name": "publisher",
    "x": 99,
    "y": 191,
    "columns": [{
        "name": "id",
        "type": "int",
        "attribute": "primary"
    }, {
        "name": "name",
        "type": "varchar(64)"
    }]
}, {
    "name": "book",
    "x": 225,
    "y": 83,
    "columns": [{
        "name": "id",
        "type": "int",
        "attribute": "primary"
    }, {
        "name": "name",
        "type": "varchar(64)"
    }, {
        "name": "owner",
        "type": "int"
    }, {
        "name": "publisher",
        "type": "int"
    }],
    "foreignKeys": [{
        "name": "fk_book_owner_id",
        "column": "owner",
        "foreignTable": "user",
        "foreignColumn": "id"
    }, {
        "name": "fk_book_publisher_id",
        "column": "publisher",
        "foreignTable": "publisher",
        "foreignColumn": "id"
    }]
}];