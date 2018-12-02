var tables = JSON.parse(window.localStorage.getItem('tables')) || [];

Vue.component('table-card', {
    props: ['table', 'editTable'],
    template: '<div class="table stripped" v-bind:style="{left: table.x + \'px\', top: table.y + \'px\'}"' +
        '   v-on:mousedown="mouseDown" v-on:touchstart="touchstart" v-on:dblclick="editTable.table = table">' +
        '   <div class="table-name">{{ table.name }}</div>' +
        '   <table>' +
        '       <tr v-for="column in table.columns">' +
        '           <td v-bind:table-name="table.name" v-bind:column-name="column.name">{{column.name}}</td>' +
        '        </tr>' +
        '    </table>' +
        '</div>',
    methods: {
        mouseDown: function (e) {
            var table = this.table;

            function move(e) {
                table.x += e.movementX;
                table.y += e.movementY;
            }

            function up() {
                window.removeEventListener('mousemove', move, !1);
            }

            window.addEventListener('mousemove', move, !1);
            window.addEventListener('mouseup', up, !1);
        },
        touchstart: function (e1) {
            var table = this.table;

            var tx = table.x;
            var ty = table.y;

            function touchmove(e2) {
                table.x = tx + (e2.touches[0].clientX - e1.touches[0].clientX);
                table.y = ty + (e2.touches[0].clientY - e1.touches[0].clientY);
            }

            function touchend() {
                window.removeEventListener('touchmove', touchmove, !1);
            }

            window.addEventListener('touchmove', touchmove, !1);
            window.addEventListener('touchend', touchend, !1);
        }
    }
});

Vue.component('column-input', {
    props: ['tables', 'table', 'column'],
    template: '<input v-model="column.name" />',
    watch: {
        'column.name': function (after, before) {
            if (this.table.foreignKeys) {
                this.table.foreignKeys.forEach(foreignKey => {
                    if (foreignKey.column == before) {
                        foreignKey.column = after;
                    }
                });
            }
            this.tables.forEach(table => {
                if (table.foreignKeys) {
                    table.foreignKeys.forEach(foreignKey => {
                        if (foreignKey.foreignTable == this.table.name && foreignKey.foreignColumn == before) {
                            foreignKey.foreignColumn = after;
                        }
                    })
                }
            })
        }
    }
});

Vue.component('table-input', {
    props: ['tables', 'table'],
    template: '<input v-model="table.name" />',
    watch: {
        'table.name': function (after, before) {
            (this.tables || []).forEach(table => {
                (table.foreignKeys || []).forEach(foreignKey => {
                    if (foreignKey.foreignTable == before) {
                        foreignKey.foreignTable = after;
                    }
                })
            });
        }
    }
});

Vue.component('foreign-path', {
    props: ['foreign-key', 'table', 'tables'],
    template: '<path stroke="black" fill="none"></path>',
    mounted: function () {
        this.$el.setAttribute('d', this.d());
    },
    methods: {
        d: function () {
            var currentColumn = document.querySelector('[table-name=' + this.table.name + '][column-name=' + this.foreignKey.column + ']');
            var foreignColumn = document.querySelector('[table-name=' + this.foreignKey.foreignTable + '][column-name=' + this.foreignKey.foreignColumn + ']');
            if (currentColumn && foreignColumn) {
                var clientRect = currentColumn.getClientRects()[0];

                var margin = 4;
                var x1l = clientRect.x - margin;
                var x1r = clientRect.x + clientRect.width + margin;
                var y1 = clientRect.y + clientRect.height / 2;

                var foreignClientRect = foreignColumn.getClientRects()[0];
                var x2l = foreignClientRect.x - margin;
                var x2r = foreignClientRect.x + foreignClientRect.width + margin;
                var y2 = foreignClientRect.y + foreignClientRect.height / 2;

                var minDist = Math.min(Math.abs(x1l - x2l), Math.abs(x1l - x2r), Math.abs(x1r - x2l), Math.abs(x1r - x2r))

                var X1, X2, X3, X4;

                var Y1 = Y2 = y1;
                var Y3 = Y4 = y2;

                var a = 0.5;
                var min = 30;

                if (minDist == Math.abs(x1l - x2l)) {
                    X1 = x1l;
                    X2 = x1l - Math.max(min, a * Math.abs(x1l - x2l));
                    X3 = x2l - Math.max(min, a * Math.abs(x1l - x2l));
                    X4 = x2l;
                } else if (minDist == Math.abs(x1l - x2r)) {
                    X1 = x1l;
                    X2 = x1l - Math.max(min, a * Math.abs(x1l - x2r));
                    X3 = x2r + Math.max(min, a * Math.abs(x1l - x2r));
                    X4 = x2r;
                } else if (minDist == Math.abs(x1r - x2l)) {
                    X1 = x1r;
                    X2 = x1r + Math.max(min, a * Math.abs(x1r - x2l));
                    X3 = x2l - Math.max(min, a * Math.abs(x1r - x2l));
                    X4 = x2l;
                } else {
                    X1 = x1r;
                    X2 = x1r + Math.max(min, a * Math.abs(x1r - x2r));
                    X3 = x2r + Math.max(min, a * Math.abs(x1r - x2r));
                    X4 = x2r;
                }

                return 'M' + X1 + ' ' + Y1 + 'C ' + X2 + ' ' + Y2 + ', ' + X3 + ' ' + Y3 + ', ' + X4 + ' ' + Y4;
            }
        }
    },
    watch: {
        tables: {
            handler: function (value) {
                this.$el.setAttribute('d', this.d());
            },
            deep: true,
        }
    }
});

var app = new Vue({
    el: '#app',
    data: {
        tables: tables,
        editTable: {
            table: null
        },
        tab: 1
    },
    methods: {
        'addColumn': function () {
            this.editTable.table.columns.push({});
        },
        'deleteColumn': function (column) {
            var index = this.editTable.table.columns.indexOf(column);
            if (index > -1) {
                this.editTable.table.columns.splice(index, 1);
            }
        },
        'addTable': function () {
            var table = {
                'name': 'Untitled',
                'x': 50,
                'y': 50,
                'columns': [],
                'foreignKeys': [],
            };
            this.tables.push(table);
            this.editTable.table = table;

        },
        'deleteTable': function (table) {
            var index = this.tables.indexOf(table);
            if (index > -1) {
                this.tables.splice(index, 1);
            }
            this.editTable.table = null;
        },
        'addForeignKey': function () {
            this.editTable.table.foreignKeys.push({});
        },
        'deleteForeignKey': function (foreignKey) {
            var index = this.editTable.table.foreignKeys.indexOf(foreignKey);
            if (index > -1) {
                this.editTable.table.foreignKeys.splice(index, 1);
            }
        },
        'save': function (content, fileName, contentType) {
            var a = document.createElement("a");
            var file = new Blob([content], {
                type: contentType
            });
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        },
        'open': function () {
            var file = document.getElementById('file-open').files[0];
            if (file) {
                fr = new FileReader();
                fr.onload = receivedText;
                fr.readAsText(file);
                var $this = this;

                function receivedText(e) {
                    let lines = e.target.result;
                    $this.tables = JSON.parse(lines);
                    console.log($this);
                }
            }
        },
        'findTableByName': function (name) {
            return this.tables.filter(function (elem) {
                return elem.name == name;
            });
        },
        'changeColumnName': function (e) {
            console.log(e);
        },
        'toggleFullscreen': function () {
            var doc = window.document;
            var docEl = doc.documentElement;

            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
            var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

            if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
                requestFullScreen.call(docEl);
            } else {
                cancelFullScreen.call(doc);
            }
        }
    },

    watch: {
        'tables': {
            'handler': function (after, before) {
                window.localStorage.setItem('tables', JSON.stringify(tables));
            },
            deep: true
        }
    }

})