(function() {
    'use strict';

    var root = this,
        $ = root.jQuery || root.Zepto,
        _ = root._,
        Backbone = root.Backbone,
        Drupal = root.Drupal,
        Citations = root.Citations;

    Citations.Wysiwyg = {};

    /**
     * Contributor model
     */
    Citations.Wysiwyg.Contributor = Backbone.Model.extend();
    
    /**
     * Citation model
     */
    Citations.Wysiwyg.Citation = Backbone.Model.extend({
        
        defaults: function() {
            return {
                type: 'website'
            };
        }
    });

    /**
     * Contributors collection
     */
    Citations.Wysiwyg.Contributors = Backbone.Collection.extend({
        model: Citations.Wysiwyg.Contributor
    });

    /**
     * The citations dialog contributor sub-view
     */
    Citations.Wysiwyg.ContributorView = Backbone.View.extend({

        tagName: 'li',

        className: 'citations-dialog-contributor',

        events: {
            'click .citations-dialog-button-remove-contributor': 'destroy',
            'blur input': 'save',
            'change select': 'save'
        },

        /**
         * initializes the view
         */
        initialize: function() {
            this.template = _.template($('#citations-template-contributor').html());
            this.model.on('destroy', this.remove, this);
        },

        /**
         * renders the view
         */
        render: function() {
            this.$el.html(this.template);
            return this; // return 'this' for method chaining
        },

        /**
         * saves the data from the view
         */
        save: function() {
            var self = this;

            this.$('[data-bind]').each(function(index, element) {
                var $el = $(element),
                    key = $el.data('bind'),
                    value = $el.val();
                
                self.model.set(key, value);
            });
        },

        /**
         * destroys the model
         */
        destroy: function() {
            this.model.destroy();
        }
    });

    /**
     * The citations dialog publication sub-view
     */
    Citations.Wysiwyg.PublicationView = Backbone.View.extend({

        events: {
            'blur input': 'save',
            'change select': 'save'
        },

        /**
         * initializes the view
         */
        initialize: function() {
            this.templates = {
                book:    _.template($('#citations-template-publication-book').html()),
                website: _.template($('#citations-template-publication-website').html())
            };
        },

        /**
         * renders the view
         */
        render: function() {
            this.$el.html(this.templates[this.model.get('type')]);
            return this; // return 'this' for method chaining
        },

        /**
         * saves the data from the view
         */
        save: function() {
            var self = this;

            this.$('[data-bind]').each(function(index, element) {
                var $el = $(element),
                    key = $el.data('bind'),
                    value = $el.val();
                
                self.model.set(key, value);
            });
        }
    });
    
    /**
     * The citations dialog view
     */
    Citations.Wysiwyg.Dialog = Backbone.View.extend({

        className: 'citations-dialog',

        events: {
            'click menu > span': 'switchPublicationType',
            'click .citations-dialog-button-add-contributor': 'createContributor',
            'click .citations-dialog-button-add-citation': 'addCitation'
        },

        /**
         * initializes the view
         */
        initialize: function(options) {
            options || (options = {});
            this.editor = options.editor;

            this.template = _.template($('#citations-template-dialog').html());

            this.citation = new Citations.Wysiwyg.Citation();
            this.citation.on('change:type', this.render, this);

            this.contributors = new Citations.Wysiwyg.Contributors();
            this.contributors.on('add', this.addContributor, this);
        },

        /**
         * renders the view
         */
        render: function() {
            this.$el.html(this.template);
            this.renderPublication();
            this.createContributor();
            return this; // return 'this' for method chaining
        },

        /**
         * renders the publication sub view
         */
        renderPublication: function() {
            var view = new Citations.Wysiwyg.PublicationView({ model: this.citation });
            this.$('.citations-dialog-publication').html(view.render().el);

            this.highlightTab(this.citation.get('type'));
        },

        /**
         * highlights the specified publication tab
         */
        highlightTab: function(publication) {
            this.$('menu > span')
                .removeClass('active');
            
            this.$('menu > span[data-type="' + publication + '"]')
                .addClass('active');
        },

        /**
         * clears the citation
         */
        clear: function() {
            this.citation.clear();
            this.contributors.reset();
        },

        /**
         * switches the publication type
         */
        switchPublicationType: function(event) {
            var type = $(event.currentTarget)
                    .data('type');

            if (this.citation.get('type') === type) return;

            this.clear();
            this.citation.set({ type: type });
        },

        /**
         * creates a new contributor object
         */
        createContributor: function() {
            var model = new Citations.Wysiwyg.Contributor();
            this.contributors.add(model);
        },

        /**
         * adds a new contributor to the view
         */
        addContributor: function(contributor) {
            var view = new Citations.Wysiwyg.ContributorView({ model: contributor });
            this.$('.citations-dialog-contributors ul')
                .append(view.render().el);
        },

        /**
         * adds the citation to the page
         */
        addCitation: function(event) {
            var template, components;

            template = _.template('<sup data-citation=\'<%- json %>\'>[?]</sup>&nbsp;');
            components = _.extend({
                contributors: this.contributors.toJSON()
            }, this.citation.toJSON());

            this.editor.insertHtml(template({ json: JSON.stringify(components) }));
            this.remove(); // remove this view
        },

        /**
         * formats the specified URL
         */
        formatUrl: function(url) {
            return url.match(/^https?:\/\//i) ? url : 'http://' + url;
        }
    });

    /**
     * DOM-Ready event callback
     */
    $(document).ready(function() {
        var templatePath = Drupal.settings.basePath 
                + 'sites/all/modules/citations/citations_wysiwyg/templates/citations.dialog.html';
        
        $('<div></div>')
            .appendTo('body')
            .hide()
            .load(templatePath);
    });

}).call(this);