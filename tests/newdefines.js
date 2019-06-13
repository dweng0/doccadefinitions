define(function(require) {
	'use strict';

	const Dashboard = require('dashboard/models/dashboard');
	const Gadgets = require('dashboard/views/gadgets');
	const Backbone = require('backbone');

	return Marionette.LayoutView.extend(
	{
		className: 'item',
		template: _.template("<div class='dashboard-container'></div>"),

		regions: {
			'dashboard': 'div'
		},

		onRender: function()
		{
			this.$el.attr('data-index', this.model.get('index'));

			const gadgets =  new Gadgets({
				gadgets: this.model.get('gadgets') || [],
				preview: this.getOption('preview')
			});

			this.showChildView('dashboard', gadgets);

			if (!this.getOption('preview'))
			{
				// manage all gadget fetch calls by triggering an event every second. This ensures that all gadgets are running
				// on the same general timer and allows the auto-refresh to be stopped / started at a central location.
				const channel = Backbone.Radio.channel('dashboard');
				this.interval = setInterval(function() {
					channel.trigger('dashboard:poll:request');
				}, 1000);
			}
		},

		onDestroy: function()
		{
			clearInterval(this.interval);
		}
	});
});
