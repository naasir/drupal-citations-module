/**
 * A module for parsing and rendering citations on a page.
 * 
 * Citations are defined on the page in 'data-citation' attributes.
 * The components of the citation (the title, author, url, etc...) are
 * stored as a JSON string in this custom attribute:
 * 
 * <a href="#" data-citation='{"type": "website", "url": "http://www.google.com"}'></a>
 * 
 * Inovking the processAll() function will replace all the citations
 * on the page with citation markers, and output formatted versions
 * of all the citations in the 'citations placeholder' element. 
 * By default, the citations placeholder element is the <references> tag:
 * 
 * <h2>References</h2>
 * <references />
 * 
 * @TODO: remove logging statements
 * @TODO: remove Drupal dependency
 */
(function() {
    'use strict';

    var root = this,
        $ = root.jQuery || root.Zepto,
        _ = root._,
        Drupal = root.Drupal;

    var Citations = root.Citations = function(options) {
        this.options = _.extend(this.options, options);
    };

    _.extend(Citations.prototype, {

        options: {
            definitionSelector:  '[data-citation]',
            placeholderSelector: 'references',
            markerCssClass: 'citation-marker',
            outputCssClass: 'citation-output'
        },

        /**
         * formats the specified property if it exists, otherwise returns an emtpy string 
         */
        format: function(property, format) {
            property = $.trim(property);
            format = format || '{1}';
            return property ? format.replace(/\{1\}/g, property) : '';
        },

        /**
         * gets the html template for the specified citation type
         */
        getCitationTemplate: function(type) {
            var template = $('#citations-template-' + type).html();
            return '<li id="<%- citationId %>"><a href="#<%- markerId %>" title="Jump to text">^</a> '
                + template + '</li>';
        },
        
        /**
         * processes all of the citations listed on the page
         */
        processAll: function() {
            var self = this, definitions, placeholder, output;

            definitions = $(this.options.definitionSelector);
            placeholder = $(this.options.placeholderSelector);
            
            if (definitions.length && !placeholder.length) {
                console.warn('Drupal Citations Module: Citations defined, but no output placeholder tag found.');
                return;
            }

            output = $('<ol></ol>').addClass(this.options.outputCssClass);
            placeholder.replaceWith(output);

            definitions.each(function(index, element) {
                // adding one as we want the index to be one-based (instead of zero-based)
                // to match the numbers of the ordered list
                self.processSingle(index + 1, $(element), output);
            });
        },

        /**
         * processes the specified citation
         */
        processSingle: function(index, definitionEl, outputEl) {
            var citation, citationId, citationHtml, markerTemplate, markerId, markerHtml;
            
            // read the components of the citaton from the 'data-citation' attribute
            citation = definitionEl.data('citation');
            citationId = 'citation-' + index;
        
            markerTemplate = $('#citations-template-marker').html();
            markerId = 'citation-marker-' + index;
            markerHtml = _.template(markerTemplate, {
                cssClass: this.options.markerCssClass,
                citationId: citationId,
                markerId: markerId,
                index: index 
            });
            definitionEl.replaceWith(markerHtml);
            
            citationHtml = _.template(this.getCitationTemplate(citation.type), { 
                citation: citation,
                citationId: citationId,
                markerId: markerId,
                format: this.format
            });
            outputEl.append(citationHtml);
        }
    });

    /**
     * DOM-Ready event callback
     */
    $(document).ready(function() {
        var templatePath = Drupal.settings.basePath 
                + 'sites/all/modules/citations/citations.tmpl.html';
        
        $('<div></div>')
            .appendTo('body')
            .hide()
            .load(templatePath, function(){
                var citations = new Citations();
                citations.processAll();
            });
    });

}).call(this);