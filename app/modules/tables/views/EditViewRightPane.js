define([
  'app',
  'core/RightPane',
  'core/widgets/timeline/TimelineWidget',
  'core/widgets/MetadataWidget',
  'core/widgets/StatusWidget'
], function(app, RightPane, TimelineWidget, MetadataWidget, StatusWidget) {

  return RightPane.extend({

    attributes: {
      class: 'scroll-y wide no-title'
    },

    beforeRender: function() {
      this.baseView.rightSidebarView.$el.addClass('scroll-y wide no-title');

      if (this.model.has(app.statusMapping.status_name)) {
        this.insertView(new StatusWidget({model: this.model}));
      }

      this.insertView(new MetadataWidget({model: this.model}));
      this.insertView(new TimelineWidget({model: this.model}));
    }
  });
});
