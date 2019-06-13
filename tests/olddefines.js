define(['shared/autocomplete/collections/localcollection',
	'policies/wizard/views/attributeschildview',
	'shared/autocomplete/views/scheduleselector',
	'shared/autocomplete/views/singleresourceselector',
	'tpl!policies/operations/shared/templates/operationtriggersuggestion.html',
	'shared/behaviors/formcontrol',
	'shared/wizard/layouts/tagging'],
function(LocalCollection,
	AttributeChildView,
	ScheduleSelector,
	SingleResourceSelector,
	operationTriggerSuggestionTemplate,
	FormControlBehavior,
	Tagging) {
	'use strict';

	var BackupOperation = AttributeChildView.extend(
	/**
	 * @lends PolicyManager.Operations.Shared.Views.BackupOperation.prototype
	 */
	{
		behaviors: _.extend({
			formControl: {
				behaviorClass: FormControlBehavior
			}
		}, AttributeChildView.prototype.behaviors),

		regions: {
			operationAutocomplete: '@ui.operationAutocomplete',
			scheduleAutocomplete: '@ui.scheduleAutocomplete',
			//taggingLocation: '#tagging'
		},

		ui: {
			recoveryTimeObjectiveMode: 'select#recoverytimeobjectivemode',
			incrementalBackup: 'input#incrementalbackup',
			snapshotMode: 'select#snapshotmode',
			hardwareType: 'select#hardwaretype',
			runMode: 'input[name$=".run.mode"]',
			scheduleName: 'input[name$=".run.scheduleName"]',
			operationAutocomplete: '#operationautocomplete',
			scheduleAutocomplete: '#scheduleautocomplete',
			rpoPeriod: '#recoveryPointObjectivePeriod',
			rpoUnits: "#recoveryPointObjectiveUnits"
		},

		events: {
			'change @ui.recoveryTimeObjectiveMode': 'onToggleRTOMode',
			'change @ui.snapshotMode': 'onSnapshotModeChange',
			'change @ui.runMode': 'onRunModeChange',
			'change @ui.rpoUnits': 'onRPOUnitsChange'
		},

		/**
		 * @constructs
		 */
		initialize: function(options)
		{
			AttributeChildView.prototype.initialize.apply(this, arguments);
		},

		onFormDeserialized: function()
		{
			this.onToggleRTOMode();
			this.onRPOUnitsChange();
			this.onSnapshotModeChange();
		},
		
		validate: function(data)
		{			
			var error;
			var propertyName = this.model.get('propertyName');
			switch (data[propertyName].run.mode)
			{
				case 'eRUN_SYNCHRONIZED_WITH_OPERATION':
				{
					if (!data[propertyName].run.operation)
					{
						error = tr("Operation is required when using 'Run on completion of operation'.");
					}
					break;
				}
				case 'eRUN_SCHEDULED':
				{
					if (!data[propertyName].run.schedule)
					{
						error = tr("Schedule is required when scheduling.");
					}
					break;
				}
			}

			/*
			if (_.isEmpty(error))
			{
				let tagError = this.tagging.validate(data);
				if (!_.isEmpty(tagError))
				{
					error = tagError;
				}
			}
			*/

			return error;
		},

		onRender: function()
		{
			/*
			this.tagging = new Tagging({
				model: new Backbone.Model({
					name: 'userTags',
					displayName: tr('Tags'),
					tags: this.model.get('userTags')
				})
			});

			this.showChildView('taggingLocation', this.tagging);
			*/

			switch (this.model.get('normalizedTypeName'))
			{
				case 'backup':
				case 'snapshot':
				case 'replicate':
				{
					var operations = this.getOption('policyOperations');
					var models = [];

					// create the suggestion models from the list of operations
					operations.each(_.bind(function(operation) {
						// exclude it self from the operations
						if (operation.cid !== this.model.get('_cid'))
						{
							var operationClone = operation.clone();
							operationClone.set('_runLabel', operation.get(operation.get('propertyName')).label);
							models.push(operationClone);
						}
					}, this));

					// Filter out CDP operations
					models = _.reject(models, function(operation) { return operation.get('normalizedTypeName') === 'cdp'; });

					var operationSuggestions = new LocalCollection(models, {
						operators: {
							_runLabel: '~'
						}
					});

					var operationTriggerSelector = new SingleResourceSelector({
						idAttribute: '_runLabel',
						placeholder: tr('Select Operation'),
						name: this.getOperationTriggerSelectorNameAttribute(this.model),
						suggestions: operationSuggestions,
						displayField: '_runLabel',
						suggestion: {
							childViewOptions: {
								template: operationTriggerSuggestionTemplate
							}
						}
					});

					operationTriggerSelector.listenTo(this, 'run:mode:changed', function(e) {
						var selectedMode = $(e.target).val();
						this.setEnabledState(selectedMode === 'eRUN_SYNCHRONIZED_WITH_OPERATION');
					});

					this.showChildView('operationAutocomplete', operationTriggerSelector);
					break;
				}
			}

			var schedulePropertyName = this.model.get('propertyName') + '.run.schedule';
			var scheduleSelector = new ScheduleSelector({
				name: schedulePropertyName,
			});
			scheduleSelector.listenTo(this, 'run:mode:changed', function(e) {
				var selectedMode = $(e.target).val();
				this.setEnabledState(selectedMode === 'eRUN_SCHEDULED');
			});

			this.listenTo(scheduleSelector, 'selected', function(model) {
				this.ui.scheduleName.val(model ? (model.get('data') ? model.get('data').name : '') : '');
			});
			this.showChildView('scheduleAutocomplete', scheduleSelector);

			AttributeChildView.prototype.onRender.call(this, arguments);

			// Trigger the change event on the run mode input radios
			this.ui.runMode.filter(':checked').change();
		},

		onToggleRTOMode: function()
		{
			var disabled = true;
			switch (this.ui.recoveryTimeObjectiveMode.val())
			{
				case 'eRTO_TAPE':
				{
					disabled = false;
					break;
				}
				case 'eRTO_FAILOVER':
				case 'eRTO_DISK':
				{
					break;
				}
			}

			this.ui.incrementalBackup.prop('disabled', disabled);

			var parent = this.ui.incrementalBackup.parent();
			if (disabled)
			{
				parent.addClass('disabled');
				this.ui.incrementalBackup.prop('checked', false);
			}
			else
			{
				parent.removeClass('disabled');
			}
		},

		onSnapshotModeChange: function()
		{
			var mode = this.ui.snapshotMode.val();

			switch (mode)
			{
				case 'eSNAPSHOT_SOFTWARE':
				case 'eSNAPSHOT_HITACHI_V2I':
				{
					this.ui.hardwareType.prop('disabled', true);
					break;
				}
				case 'eSNAPSHOT_HARDWARE':
				{
					this.ui.hardwareType.prop('disabled', false);
					break;
				}
			}
		},

		/**
		 * Handles the run mode change event and triggers the run:mode:changed and passes the event
		 * @param {JQueryEvent} e The event
		 */
		onRunModeChange: function(e)
		{
			this.toggleRPOOptions();
			this.triggerMethod('run:mode:changed', e);
		},

		onRPOUnitsChange: function(event)
		{
			this.toggleRPOOptions();
		},

		toggleRPOOptions: function()
		{
			var synchronizedWithOperation = this.ui.runMode.filter(':checked').val() === 'eRUN_SYNCHRONIZED_WITH_OPERATION';
			this.ui.rpoUnits.prop('disabled', synchronizedWithOperation);
			this.ui.rpoPeriod.prop('disabled', this.ui.rpoUnits.val() === 'eRPO_NONE' || synchronizedWithOperation);
		},

		/**
		 * Gets the name attribute used on the input element for the operation trigger selector
		 * @protected
		 * @param {Object} model The model used to get the name attribute
		 * @returns {String} The name for the operation trigger selector input
		 */
		getOperationTriggerSelectorNameAttribute: function(model)
		{
			return model.get('propertyName') + '.run.operation';
		},

		applyPageData: function(workingData, formData)
		{
			//this.tagging.serializeTags(workingData, formData);
			AttributeChildView.prototype.applyPageData.call(this, workingData, formData);
		}
	});

	return BackupOperation;
});
