/**
 * A CKEditor plugin which adds a button to the toolbar for adding citations to content.
 * This plugin is meant to work in conjuction with citations.js.
 */
(function() {
    'use strict';

    var root = this,
        $ = root.jQuery,
        _ = root._,
        CKEDITOR = root.CKEDITOR,
        Citations = root.Citations;

    CKEDITOR.plugins.add('citations', {
        init: function(editor) {
            editor.addCommand('citationDialog', {
                exec: function(editor) {
                    // if the citations dialog is already open, do nothing
                    if ($('.citations-dialog').is(':visible')) return;

                    var view = new Citations.Wysiwyg.Dialog({ editor: editor });
                    $('body').append(view.render().el);

                    // display the view as a floating dialog (via jQuery UI)
                    $('.citations-dialog').dialog({ 
                        resizable: false, 
                        minWidth: 400, 
                        close: function() { view.remove(); }
                    });
                }
            });
            editor.ui.addButton('citations', {
                label: 'Add Citation',
                command: 'citationDialog',
                // icon: this.path + 'images/fn_icon.png'
            });
        }
    });
}).call(this);