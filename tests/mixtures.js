define(function(require) {
	'use strict';

	const Backbone = require('backbone');
	const Radio = require('backbone.radio');
	const Marionette = require('backbone.marionette');
	const localRequire = require('require');
	const appConfig = require('core/config/appconfig');
	const Routers = require('routers');
	const localization = require('core/localization');
	const Session = require('core/models/session');
	const User = require('core/models/user');
	const RootLayout = require('foundation/views/rootlayout');
	const LoginLayout = require('login/layout');
	const Wizard = require('core/screens/wizard');
	const UnauthorizedDialog = require('foundation/dialogs/unauthorizeddialog');
	const Schema = require('dashboard/models/schema'); //FIXME
	const NodeTypes = require('nodemanager/nodes/collections/nodetypes');
	const Notifications = require('foundation/notifications/collections/notifications');
	const DataFlowRules = require('dataflow/collections/rules');
	const AccessLevels = require('rbac/collections/accesslevels');

	const unauthorizedDialogOnce = _.once(function(session) {
		console.log("Display unauthorized dialog");
		//  then, bind (name) params(binds params
		UnauthorizedDialog().show().then(_.bind(session.destroy, session));
	});

	const Application = Backbone.Marionette.Application.extend(
	/**
	 * @lends Application.prototype
	 */
	{
		session: null,
		user: null,
		/**
		 * Identify when the application is unloading due to page reload
		 */
		unloading: false,
		redirectOnLogin: '',
		dataCache: null,

		/**
		 * @constructs
		 */
		initialize: function()
		{
			console.log("Application:Initialize");
			this.dataCache = {};

			// check global `app` instance
			if (app)
			{
				throw "Unable to instance multiple applications";
			}

			// FIX ME - don't merge these, use getConfig instead?
			_.defaults(this.options, appConfig);

			this.extensions = {};

			$(window).on('unload', _.bind(this.onApplicationUnload, this));
			// $(document).ajaxStart(function() { console.log("AJAX START"); });
			// $(document).ajaxSend(function() { console.log("AJAX SEND"); });
			// $(document).ajaxComplete(function() { console.log("AJAX COMPLETE"); });
			$(document).ajaxSuccess(_.bind(this.onAjaxSuccess, this));
			$(document).ajaxError(_.bind(this.onAjaxError, this));
			// $(document).ajaxStop(function() { console.log("AJAX STOP"); });

			this.routerChannel = Backbone.Radio.channel('router');
			this.listenTo(this.routerChannel, 'before:enter:route', this.onBeforeEnterRoute);
			this.listenTo(this.routerChannel, 'enter:route', this.onAfterEnterRoute);

			// Initialize all the routers
			Routers.initialize();
		},

		getConfig: function(key)
		{
			return key ? appConfig.get(key) : appConfig;
		},

		/**
		 * @returns {Session} Returns the current user session object
		 */
		getSession: function()
		{
			return this.session;
		},

		/**
		 * @returns {User} Returns the logged in user object. null if not logged in.
		 */
		getUser: function()
		{
			return this.user;
		},

		/**
		 * @param {String} name data index for caching
		 * @param {Class} CollectionClass collection constructor
		 * @param {Object} options options for this method
		 * @param {Object} dataOptions options passed to the collection constructor
		 * @param {Object} fetchOptions options passed into the collection when fetch is called 
		 * @returns a cached or new collection
		 */
		getData: function(name, CollectionClass, options, dataOptions, fetchOptions)
		{
			options = options || {};

			let newCollection = false;
			let data = null;
			if ((!name || !this.dataCache[name]) && _.isFunction(CollectionClass))
			{
				newCollection = true;
				this.dataCache[name] = new (CollectionClass)(null, (dataOptions || {}));
			}

			data = this.dataCache[name];
			// Deselecting all items before returning cached models prevents inconsistent toolbar state
			if (data && _.isFunction(data.deselectAll))
			{
				data.deselectAll();
			}

			if (data && (options.fetch || (options.fetchOnce && newCollection)))
			{
				data.fetch(fetchOptions);
			}

			return data;
		},

		/**
		 * If data is supplied the data is cached in the name index provided
		 * otherwise the data from that index is returned and deleted from the cache
		 * @param {String} name data index for caching
		 * @param {Object} data data to be cached
		 * @returns cachedData
		 */
		cacheData: function(name, data)
		{
			if (typeof name === "string")
			{
				if (data)
				{
					this.dataCache[name] = data;
				}
				else
				{
					let cachedData = this.dataCache[name];
					delete this.dataCache[name];
					return cachedData;
				}
			}
		},

		getLoginRedirectFor: function(user)
		{
			let redirectOnLogin;
			if (this.redirectOnLogin[user])
			{
				redirectOnLogin = this.redirectOnLogin[user];
				delete this.redirectOnLogin[user];
			}
			return redirectOnLogin;
		},

		getExtension: function(name)
		{
			name = name.toLowerCase();

			if (!this.extensions[name])
			{
				console.warn("Extension", name, "has not been loaded");
			}

			return this.extensions[name];
		},

		/**
		 * Displays the specified screen view
		 */
		showScreen: function(view)
		{
			if (!(view instanceof Backbone.Marionette.View))
			{
				throw new Error("Invalid page view, unable to display");
			}
			else
			{
				this.rootLayout.showScreen(view);
			}

			return view;
		},

		/**
		 * Displays the specified modal dialog view
		 * @param {Backbone.Marionette.View} view The view to be shown as a modal dialog
		 * @return {Backbone.Marionette.View}
		 */
		showDialogView: function(view)
		{
			// Should this be Shared.Dialog?
			if (!(view instanceof Backbone.Marionette.ItemView))
			{
				console.error("Dialog view is invalid", view);
				throw new Error("Invalid dialog view, unable to display");
			}
			else
			{
				this.rootLayout.showDialog(view);
			}
			return view;
		},

		/**
		 * Sets the browser (tab) and page title
		 */
		setDocumentTitle: function(title)
		{
			document.title = (title ? title + ' - ' : '') + this.getConfig('applicationName');
		},

		onStart: function()
		{
			$('body').hide();
			this.rootLayout = new RootLayout();

			// Capture the beforeunload event to prompt before leaving an incomplete wizard
			$(window).on('beforeunload', function(event) {
				/*
				 * The 'beforeunload' event allows the application to request confirmation before navigating away.
				 * Current Chrome (52.0.2743.116 m), Firefox (47.0.1) and IE (11.0.9600.18426) handle the page refresh event,
				 * but only Chrome handles the URL change event.
				 * It isn't like the user would accidentally refresh (or less so) change URL. Since this event cannot
				 * be handled in the same way as typical application navigation it has not been implemented.
				 * This can be fixed more correctly if it becomes a problem for users.
				 */
				return;
			});

			let app = this;

			// Load the local for the current user (or anonymous user).
			this.initializeLocale()
			.then(function() {
				// Load application data
				return app.loadApplicationData();
			})
			.then(function() {
				app.session = Session.resume();

				// if the session is destroyed, logout
				app.listenTo(app.session, 'destroy', app.logout);

				let next = [];
				if (app.session)
				{
					next.push(app.loadUserData());
					next.push(app.loadPrivateApplicationData()
					.then(function() {
						return app.loadExtensions()
					}));
				}

				return _.whenAll(next);
			})
			.always(function() {
				app.onPreloadComplete();
			});
		},

		initializeLocale: function()
		{
			console.group("initialize locale");

			let lang;
			let use24Hour;
			const user = this.getUser();

			if (user)
			{
				const locale = user.get('locale');

				lang = locale.lang;
				use24Hour = !_.isUndefined(locale.use24HourTime) ? locale.use24HourTime : true;
			}

			return localization.init(lang, use24Hour).always(function() {
				console.groupEnd("initialize locale");
			});
		},

		/**
		 * Data loaded once when the application is started
		 * Note: Cannot use this.dataCache to store data loading in this method as it's cleared on logout 
		 *       and will not be reloaded on login.
		 */
		loadApplicationData: function()
		{
			let requests = [];

			const colorPicker = this.getConfig('development') ? 'colorpicker' : 'venders/evol-colorpicker.min';

			// jquery-ui is required by the color picker, but it doesn't require it itself
			requests.push(_.require(['jquery-ui']).then(function() {
				return _.require([colorPicker]);
			}));

			return _.whenAll(requests);
		},

		/**
		 * User session data. Called when the application is started (and the user is authorized) and again each time
		 * a user logs in.
		 */
		loadUserData: function()
		{
			console.group("load user data");

			this.user = new User({
				id: 'CurrentUser'
			});

			const self = this;
			// Fetch the user information
			let deferred = this.user.fetch();
			deferred.then(function() {
				// only after the initial sync should changing the local trigger a re-render
				self.listenTo(this.user, 'change:locale', function(model, value, options) {

					let use24Hour = !_.isUndefined(value.use24HourTime) ? value.use24HourTime : true;
					localization.setLocale(value.lang, use24Hour).then(function() {
						$('html').attr('lang', value.lang);

						if (self.rootLayout.isRendered)
						{
							self.rootLayout.render();
						}
					});
				});
			}).always(function() {
				console.groupEnd("load user data");
			});

			return deferred;
		},

		loadPrivateApplicationData: function()
		{
			console.group("load private application data");
			let deferred = [];

			const accessLevels = new AccessLevels();
			const nodeTypes = new NodeTypes();
			const dataflowRules = new DataFlowRules();
			const schema = new Schema();

			deferred.push(accessLevels.fetch());
			deferred.push(nodeTypes.fetch());
			deferred.push(dataflowRules.fetch());
			deferred.push(schema.fetch());

			// Initialize the notification collection so notifications can be captured immediately (local collection only)
			this.dataCache['client:notifications'] = new Notifications();
			this.dataCache['accesscontrol:accesslevels'] = accessLevels;
			this.dataCache['nodemanager:nodetypes'] = nodeTypes;
			this.dataCache['dataflow:rules'] = dataflowRules;
			this.dataCache['schema'] = schema;

			// Display an error if any request fails
			return _.whenAll(deferred).then(function() {
				console.groupEnd("load private application data");
			}, function(xhr, textStatus, errorThrown) {
				console.groupEnd("load private application data");
				console.error("Failed to load private application data", textStatus, errorThrown, xhr);
			});
		},

		/**
		 * Loads nodes extensions based on provided node types
		 */
		loadExtensions: function()
		{
			console.group("load application extensions");
			const app = this;

			const loadExtension = function(name) {
				name = name.toLowerCase();

				const path = 'extensions/nodes/' + encodeURIComponent(name) + '/extension';
				console.debug("Loading extension for '%s' (%s)", name, path);
				return _.localRequire([path])
				.then(function(Module) {
					console.debug("Module '%s' loaded successfully", name);
					app.extensions[name] = new Module();
				})
				.fail(function(err) {
					console.error("Failed to load extension '%s' from '%s'", name, path, err);
				});
			};

			let nodeTypes = this.dataCache['nodemanager:nodetypes'];
			let requests = nodeTypes.map(function(nodeTypes) {
				return loadExtension(nodeTypes.id);
			});

			return _.whenAll(requests).always(function() {
				console.groupEnd("load application extensions");
			});
		},

		/**
		 * Called after Application#start when the locale has loaded
		 * @private
		 */
		onPreloadComplete: function()
		{
			console.debug("preload completed");

			// Set the HTML language to prevent the browser offering to translate the site
			let user = this.getUser();
			if (user)
			{
				const local = user.get('locale');
				$('html').attr('lang', local.lang);
			}
			else
			{
				// TODO set locale for default language
			}

			this.rootLayout.render();

			/**
			 * Start Backbone.history
			 * Cannot use pushState as the NGINX will attempt to serve incorrect pages based on the URL.
			 * It would require 'mod_rewrite' like behaviour to support pushState.
			 */
			Backbone.history.start();
		},

		logout: function()
		{
			// If the user logs out (for any reason) remember where they were so they can return to that page when logging in
			let fragment = Backbone.history.fragment;
			if (fragment !== 'Login')
			{
				this.redirectOnLogin = {};
				this.redirectOnLogin[this.user.id] = '/' + fragment;
			}

			this.session = null;
			this.user = null;

			// Clear the cache, ensure event handlers for Models and Collections are removed
			_.each(this.dataCache, function(item) {
				// Remove all event handlers
				if (_.isFunction(item.stopListening) && _.isFunction(item.off))
				{
					item.stopListening();
					item.off();
				}
			});

			this.dataCache = {};

			let anim = Backbone.$.Deferred();
			$('body').fadeOut({ complete: function() {
				anim.resolve();
			}});

			let self = this;
			anim.then(function() {
				// Render the root layout to remove the application components
				self.rootLayout.render();

				// Navigate to the login screen
				Backbone.history.navigate('#/Login', true);
			});
		},

		onBeforeEnterRoute: _.noop(),

		onAfterEnterRoute: _.noop(),

		onApplicationUnload: function()
		{
			this.unloading = true;
		},

		onAjaxSuccess: function(event, xhr, settings, thrownError)
		{
		},

		onAjaxError: function(event, xhr, settings, thrownError)
		{
			// Ignore errors when the application is unloading
			if (this.unloading)
			{
				return;
			}

			// Ignore errors to the local machine name server.
			if (this.getConfig('localLookupUrl') === settings.url)
			{
				// Currently this request is made before the authorized state of the user is set so it has no affect here.
				return;
			}

			// console.debug("Request failed!", arguments);
			let session = this.getSession();
			if (session)
			{
				const url = settings ? settings.url : null;
				const response = xhr ? (xhr.responseJSON || xhr.responseText) : null;

				if (xhr.status === 0 && !thrownError)
				{
					console.warn("Received null response for '%s', closing session", url, response);
					session.destroy();
				}
				else if (xhr.status === 401)
				{
					console.warn("Received unauthorized response for '%s', notifying user", url, response);
					unauthorizedDialogOnce(session);
				}
			}
		}
	});

	let app = null;

	const mod = function() {
		const init = function() {
			app = new Application();

			// For debugging expose the application onto the Window
			if (app.getConfig('development'))
			{
				window.app = app;
			}

			return app;
		}

		return app ? app : init();
	}

	// backwards compatibility
	mod.getInstance = function() {
		console.warn("`require('application').getInstance` is deprecated, use `require('application')()` instead");
		return mod();
	};

	return mod;
});
