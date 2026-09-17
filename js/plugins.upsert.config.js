/*
* FileName "plugins.upsert.config.js"
* Version: 1.0.0
* Copyright (c) 2023 Pandafirm LLC
* Distributed under the terms of the GNU Lesser General Public License.
* https://opensource.org/licenses/LGPL-2.1
*/
"use strict";
((PLUGIN_ID) => {
	var vars={};
	bst.field.load(kintone.app.getId()).then((fieldInfos) => {
		bst.status.load(kintone.app.getId()).then((statusInfos) => {
			bst.view.load(kintone.app.getId()).then((viewInfos) => {
				bst.apps.load().then((appInfos) => {
					bst.config[PLUGIN_ID].build(
						{
							submit:(container,config) => {
								try
								{
									var error=false;
									config.tab=[];
									config.flat={};
									((app) => {
										bst.config[PLUGIN_ID].tabbed.tabs.some((item) => {
											var res=bst.record.get(item.panel,app);
											if (!res.error)
											{
												if (!error)
												{
													if (res.record.event.value.includes('process'))
													{
														if (!res.record.action.value)
														{
															bst.alert(bst.constants.config.message.invalid.action[bst.operator.language]);
															bst.config[PLUGIN_ID].tabbed.activate(item);
															error=true;
														}
													}
													else res.record.action.value='';
												}
												if (!error)
												{
													if (res.record.event.value.includes('detail'))
													{
														if (!res.record.label.value)
														{
															bst.alert(bst.constants.config.message.invalid.label.detail[bst.operator.language]);
															bst.config[PLUGIN_ID].tabbed.activate(item);
															error=true;
														}
														if (!res.record.message.value)
														{
															bst.alert(bst.constants.config.message.invalid.message.detail[bst.operator.language]);
															bst.config[PLUGIN_ID].tabbed.activate(item);
															error=true;
														}
													}
													else
													{
														if (res.record.event.value.includes('index'))
														{
															if (!res.record.label.value)
															{
																bst.alert(bst.constants.config.message.invalid.label.index[bst.operator.language]);
																bst.config[PLUGIN_ID].tabbed.activate(item);
																error=true;
															}
															if (!res.record.message.value)
															{
																bst.alert(bst.constants.config.message.invalid.message.index[bst.operator.language]);
																bst.config[PLUGIN_ID].tabbed.activate(item);
																error=true;
															}
														}
														else
														{
															res.record.label.value='';
															res.record.message.value='';
															res.record.view.value='';
														}
													}
												}
												if (!error)
												{
													((fields) => {
														var criteria={
															config:[],
															divide:[],
															table:{}
														};
														var mapping={
															config:[],
															divide:[],
															table:{}
														};
														((pattern) => {
															switch (pattern)
															{
																case 'update':
																case 'upsert':
																	res.record.criteria.value.each((values,index) => {
																		if (values.value.external.value && values.value.internal.value)
																		{
																			criteria.config.push(values);
																			((tables) => {
																				if (tables.internal)
																				{
																					if (tables.external)
																					{
																						if (!(tables.external in criteria.table)) criteria.table[tables.external]=[];
																						criteria.table[tables.external].push(tables.internal);
																					}
																					else criteria.divide.push(tables.internal);
																				}
																			})({
																				external:fields.external[values.value.external.value].tableCode,
																				internal:fields.internal[values.value.internal.value].tableCode
																			});
																		}
																	});
																	if (criteria.config.length==0)
																	{
																		bst.alert(bst.constants.config.message.invalid.criteria[bst.operator.language]);
																		bst.config[PLUGIN_ID].tabbed.activate(item);
																		error=true;
																	}
																	else
																	{
																		criteria.divide=Array.from(new Set(criteria.divide)).filter((item) => item);
																		for (var key in criteria.table) criteria.table[key]=Array.from(new Set(criteria.table[key])).filter((item) => item);
																		if (criteria.divide.length>1)
																		{
																			bst.alert(bst.constants.config.message.invalid.dividing[bst.operator.language]);
																			bst.config[PLUGIN_ID].tabbed.activate(item);
																			error=true;
																		}
																		else
																		{
																			if (Array.from(new Set(Object.values(criteria.table).flat())).filter((item) => item).length>1)
																			{
																				bst.alert(bst.constants.config.message.invalid.multiple[bst.operator.language]);
																				bst.config[PLUGIN_ID].tabbed.activate(item);
																				error=true;
																			}
																			else
																			{
																				for (var key in criteria.table)
																					if (criteria.table[key].join('')!=criteria.divide.join('') && criteria.divide.join(''))
																					{
																						bst.alert(bst.constants.config.message.invalid.diversion[bst.operator.language]);
																						bst.config[PLUGIN_ID].tabbed.activate(item);
																						error=true;
																						break;
																					}
																			}
																		}
																	}
																	break;
															}
															if (!error)
															{
																res.record.mapping.value.each((values,index) => {
																	if (values.value.external.value && values.value.internal.value)
																	{
																		mapping.config.push(values);
																		((tables) => {
																			if (tables.internal)
																			{
																				if (tables.external)
																				{
																					if (!(tables.external in mapping.table)) mapping.table[tables.external]=[];
																					mapping.table[tables.external].push(tables.internal);
																				}
																				else mapping.divide.push(tables.internal);
																			}
																		})({
																			external:fields.external[values.value.external.value].tableCode,
																			internal:fields.internal[values.value.internal.value].tableCode
																		});
																	}
																});
																if (mapping.config.length==0)
																{
																	bst.alert(bst.constants.config.message.invalid.mapping[bst.operator.language]);
																	bst.config[PLUGIN_ID].tabbed.activate(item);
																	error=true;
																}
																else
																{
																	mapping.divide=Array.from(new Set(mapping.divide)).filter((item) => item);
																	for (var key in mapping.table) mapping.table[key]=Array.from(new Set(mapping.table[key])).filter((item) => item);
																	if (mapping.divide.length>1)
																	{
																		bst.alert(bst.constants.config.message.invalid.dividing[bst.operator.language]);
																		bst.config[PLUGIN_ID].tabbed.activate(item);
																		error=true;
																	}
																	else
																	{
																		for (var key in mapping.table)
																		{
																			if (mapping.table[key].length>1)
																			{
																				bst.alert(bst.constants.config.message.invalid.various[bst.operator.language]);
																				bst.config[PLUGIN_ID].tabbed.activate(item);
																				error=true;
																				break;
																			}
																		}
																		if (!error)
																		{
																			switch (pattern)
																			{
																				case 'update':
																				case 'upsert':
																					if (mapping.divide.length!=0)
																					{
																						if (criteria.divide.length==0)
																						{
																							bst.alert(bst.constants.config.message.invalid.unmatch[bst.operator.language]);
																							bst.config[PLUGIN_ID].tabbed.activate(item);
																							error=true;
																						}
																						else
																						{
																							if (mapping.divide.join('')!=criteria.divide.join(''))
																							{
																								bst.alert(bst.constants.config.message.invalid.dividing[bst.operator.language]);
																								bst.config[PLUGIN_ID].tabbed.activate(item);
																								error=true;
																							}
																						}
																					}
																					break;
																			}
																			if (!error)
																			{
																				if (res.record.formulaDestination.value.some((item) => {
																					return item.value.formula.value.match(/(class |fetch\(|function\(|XMLHttpRequest\(|=>|var |let |const )/g);
																				}))
																				{
																					bst.alert(bst.constants.config.message.invalid.formula[bst.operator.language]);
																					bst.config[PLUGIN_ID].tabbed.activate(item);
																					error=true;
																				}
																				else
																				{
																					if (res.record.formulaSource.value.some((item) => {
																						return item.value.formula.value.match(/(class |fetch\(|function\(|XMLHttpRequest\(|=>|var |let |const )/g);
																					}))
																					{
																						bst.alert(bst.constants.config.message.invalid.formula[bst.operator.language]);
																						bst.config[PLUGIN_ID].tabbed.activate(item);
																						error=true;
																					}
																					else
																					{
																						res.record.criteria.value=criteria.config;
																						res.record.mapping.value=mapping.config;
																						res.record.formulaDestination.value=res.record.formulaDestination.value.filter((item) => item.value.field.value);
																						res.record.formulaSource.value=res.record.formulaSource.value.filter((item) => item.value.field.value);
																						config.tab.push({label:item.label.html(),setting:res.record});
																					}
																				}
																			}
																		}
																	}
																}
															}
														})(res.record.pattern.value);
													})({
														external:item.fields.external.parallelize,
														internal:item.fields.internal.parallelize
													});
												}
											}
											else
											{
												bst.alert(bst.constants.common.message.invalid.record[bst.operator.language]);
												bst.config[PLUGIN_ID].tabbed.activate(item);
												error=true;
											}
											return error;
										});
									})({
										id:vars.app.id,
										fields:vars.app.fields.tab
									});
									config.tab=JSON.stringify(config.tab);
									config.flat=JSON.stringify(config.flat);
									return !(error)?config:false;
								}
								catch(error)
								{
									bst.alert(bst.error.parse(error));
									return false;
								}
							}
						},
						(container,config) => {
							try
							{
								vars.app={
									id:PLUGIN_ID,
									fields:{
										tab:{
											event:{
												code:'event',
												type:'CHECK_BOX',
												label:'',
												required:true,
												noLabel:true,
												options:[
													{index:0,label:'create'},
													{index:1,label:'edit'},
													{index:2,label:'process'},
													{index:3,label:'detail'},
													{index:4,label:'index'}
												]
											},
											action:{
												code:'action',
												type:'DROP_DOWN',
												label:bst.constants.config.caption.action[bst.operator.language],
												required:false,
												noLabel:false,
												options:[]
											},
											label:{
												code:'label',
												type:'SINGLE_LINE_TEXT',
												label:bst.constants.config.caption.label[bst.operator.language],
												required:false,
												noLabel:false,
												placeholder:''
											},
											message:{
												code:'message',
												type:'SINGLE_LINE_TEXT',
												label:bst.constants.config.caption.message[bst.operator.language],
												required:false,
												noLabel:false,
												placeholder:''
											},
											view:{
												code:'view',
												type:'DROP_DOWN',
												label:bst.constants.config.caption.view[bst.operator.language],
												required:false,
												noLabel:false,
												options:[]
											},
											app:{
												code:'app',
												type:'DROP_DOWN',
												label:'',
												required:true,
												noLabel:true,
												options:[]
											},
											pattern:{
												code:'pattern',
												type:'RADIO_BUTTON',
												label:'',
												required:true,
												noLabel:true,
												options:[
													{index:0,label:'insert'},
													{index:1,label:'update'},
													{index:2,label:'upsert'}
												]
											},
											criteria:{
												code:'criteria',
												type:'SUBTABLE',
												label:'',
												noLabel:true,
												fields:{
													external:{
														code:'external',
														type:'DROP_DOWN',
														label:bst.constants.config.caption.destination[bst.operator.language],
														required:false,
														noLabel:true,
														options:[]
													},
													operator:{
														code:'operator',
														type:'DROP_DOWN',
														label:'',
														required:false,
														noLabel:true,
														options:[]
													},
													internal:{
														code:'internal',
														type:'DROP_DOWN',
														label:bst.constants.config.caption.source[bst.operator.language],
														required:false,
														noLabel:true,
														options:[]
													}
												}
											},
											filter:{
												code:'filter',
												type:'CONDITION',
												label:'',
												required:false,
												noLabel:true,
												app:{
													id:kintone.app.getId(),
													fields:fieldInfos.parallelize
												}
											},
											mapping:{
												code:'mapping',
												type:'SUBTABLE',
												label:'',
												noLabel:true,
												fields:{
													external:{
														code:'external',
														type:'DROP_DOWN',
														label:bst.constants.config.caption.destination[bst.operator.language],
														required:false,
														noLabel:true,
														options:[]
													},
													guide:{
														code:'guide',
														type:'SPACER',
														label:'',
														required:false,
														noLabel:true,
														contents:'<span class="bst-icon bst-icon-arrow bst-icon-arrow-left"></span>'
													},
													internal:{
														code:'internal',
														type:'DROP_DOWN',
														label:bst.constants.config.caption.source[bst.operator.language],
														required:false,
														noLabel:true,
														options:[]
													}
												}
											},
											formulaDestination:{
												code:'formulaDestination',
												type:'SUBTABLE',
												label:'',
												noLabel:true,
												fields:{
													field:{
														code:'field',
														type:'DROP_DOWN',
														label:bst.constants.config.caption.destination[bst.operator.language],
														required:false,
														noLabel:true,
														options:[]
													},
													guide:{
														code:'guide',
														type:'SPACER',
														label:'',
														required:false,
														noLabel:true,
														contents:'<span class="bst-icon bst-icon-arrow bst-icon-arrow-left"></span>'
													},
													formula:{
														code:'formula',
														type:'SINGLE_LINE_TEXT',
														label:bst.constants.config.caption.formula.formula[bst.operator.language],
														required:false,
														noLabel:true
													}
												}
											},
											formulaSource:{
												code:'formulaSource',
												type:'SUBTABLE',
												label:'',
												noLabel:true,
												fields:{
													field:{
														code:'field',
														type:'DROP_DOWN',
														label:bst.constants.config.caption.source[bst.operator.language],
														required:false,
														noLabel:true,
														options:[]
													},
													guide:{
														code:'guide',
														type:'SPACER',
														label:'',
														required:false,
														noLabel:true,
														contents:'<span class="bst-icon bst-icon-arrow bst-icon-arrow-left"></span>'
													},
													formula:{
														code:'formula',
														type:'SINGLE_LINE_TEXT',
														label:bst.constants.config.caption.formula.formula[bst.operator.language],
														required:false,
														noLabel:true
													}
												}
											}
										},
										flat:{
										}
									}
								};
								var setup=(tab,app,record) => {
									bst.record.set(tab.panel,app,(() => {
										if (record.event.value.includes('process')) tab.panel.elm('[field-id=action]').closest('section').removeClass('bst-hidden');
										if (record.event.value.includes('detail')) tab.panel.elm('[field-id=label]').closest('section').removeClass('bst-hidden');
										if (record.event.value.includes('detail')) tab.panel.elm('[field-id=message]').closest('section').removeClass('bst-hidden');
										if (record.event.value.includes('index')) tab.panel.elm('[field-id=label]').closest('section').removeClass('bst-hidden');
										if (record.event.value.includes('index')) tab.panel.elm('[field-id=message]').closest('section').removeClass('bst-hidden');
										if (record.event.value.includes('index')) tab.panel.elm('[field-id=view]').closest('section').removeClass('bst-hidden');
										tab.panel.elm('[field-id=app]').elm('select').val(record.app.value).rebuild().then((fields) => {
											tab.tables.criteria.clearRows();
											record.criteria.value.each((values,index) => {
												if (values.value.external.value in fields.criteria)
													((row) => {
														row.elm('[field-id=external]').elm('select').val(values.value.external.value).rebuild().then((fields) => {
															if (values.value.internal.value in fields)
															{
																row.elm('[field-id=operator]').elm('select').val(values.value.operator.value);
																row.elm('[field-id=internal]').elm('select').val(values.value.internal.value);
															}
														});
													})(tab.tables.criteria.addRow());
											});
											if (tab.tables.criteria.tr.length==0) tab.tables.criteria.addRow();
											tab.tables.mapping.clearRows();
											record.mapping.value.each((values,index) => {
												if (values.value.external.value in fields.mapping)
													((row) => {
														row.elm('[field-id=external]').elm('select').val(values.value.external.value).rebuild().then((fields) => {
															if (values.value.internal.value in fields) row.elm('[field-id=internal]').elm('select').val(values.value.internal.value);
														});
													})(tab.tables.mapping.addRow());
											});
											if (tab.tables.mapping.tr.length==0) tab.tables.mapping.addRow();
											tab.tables.formula.destination.clearRows();
											record.formulaDestination.value.each((values,index) => {
												if (values.value.field.value in fields.formula)
													((row) => {
														row.elm('[field-id=field]').elm('select').val(values.value.field.value).rebuild();
														row.elm('[field-id=formula]').elm('input').val(values.value.formula.value);
													})(tab.tables.formula.destination.addRow());
											});
											if (tab.tables.formula.destination.tr.length==0) tab.tables.formula.destination.addRow();
											((field) => {
												field.elm('.bst-guide').empty();
												if (record.filter.value)
												{
													field.elm('input').val(record.filter.value);
													record.filter.value.split(' and ').each((value,index) => field.guide(value));
												}
												else field.elm('input').val('');
											})(tab.panel.elm('[field-id=filter]').elm('.bst-field-value'));
											if (record.pattern.value!='insert') tab.tables.criteria.closest('section').show().previousSibling.show();
										});
										return record;
									})())
									.then(() => {
										tab.tables.formula.destination.tr.each((element,index) => {
											element.elm('select').rebuild(false);
										});
										tab.tables.formula.source.tr.each((element,index) => {
											element.elm('select').rebuild(false);
										});
									});
								};
								((fieldInfos) => {
									for (var key in fieldInfos) vars.app.fields.tab[key]=fieldInfos[key];
								})(bst.config[PLUGIN_ID].ui.fields.conditions.get(fieldInfos,true));
								((fieldInfos) => {
									for (var key in fieldInfos) vars.app.fields.tab[key]=fieldInfos[key];
								})(bst.config[PLUGIN_ID].ui.fields.users.get(fieldInfos));
								/* tabbed */
								bst.config[PLUGIN_ID].tabbed=new BooooooostConfigTabbed(
									container,
									{
										add:(tab) => {
											((app) => {
												tab.fields={
													external:{},
													internal:fieldInfos
												};
												tab.tables={
													criteria:bst.table.create(app.fields.criteria,false,false,false).spread((row,index) => {
														/* event */
														row.elm('.bst-table-row-add').on('click',(e) => {
															tab.tables.criteria.insertRow(row);
														});
														row.elm('.bst-table-row-del').on('click',(e) => {
															bst.confirm(bst.constants.common.message.confirm.delete[bst.operator.language],() => {
																tab.tables.criteria.delRow(row);
															});
														});
														/* modify elements */
														((cells) => {
															cells.external.on('change',(e) => e.currentTarget.rebuild()).rebuild=() => {
																return new Promise((resolve,reject) => {
																	cells.operator.empty();
																	cells.internal.empty().assignOption([{code:'',label:''}],'label','code');
																	if (cells.external.val())
																	{
																		resolve((() => {
																			var res={};
																			cells.operator.assignOption(bst.filter.query.operator(tab.fields.external.parallelize[cells.external.val()]),'label','code');
																			for (var key in tab.fields.internal.parallelize)
																				((fieldInfo) => {
																					if (bst.field.typing(fieldInfo,tab.fields.external.parallelize[cells.external.val()],true)) res[fieldInfo.code]=fieldInfo;
																				})(tab.fields.internal.parallelize[key]);
																			cells.internal.assignOption(Object.values(res),'label','code');
																			return res;
																		})());
																	}
																	else resolve({});
																});
															};
														})({
															external:row.elm('[field-id=external]').elm('select'),
															operator:row.elm('[field-id=operator]').elm('select'),
															internal:row.elm('[field-id=internal]').elm('select')
														});
													},(table,index) => {
														if (table.tr.length==0) table.addRow();
													},false),
													mapping:bst.table.create(app.fields.mapping,false,false,false).addClass('bst-mapping').spread((row,index) => {
														/* event */
														row.elm('.bst-table-row-add').on('click',(e) => {
															tab.tables.mapping.insertRow(row);
														});
														row.elm('.bst-table-row-del').on('click',(e) => {
															bst.confirm(bst.constants.common.message.confirm.delete[bst.operator.language],() => {
																tab.tables.mapping.delRow(row);
															});
														});
														/* modify elements */
														((cells) => {
															cells.external.on('change',(e) => e.currentTarget.rebuild()).rebuild=() => {
																return new Promise((resolve,reject) => {
																	cells.internal.empty().assignOption([{code:'',label:''}],'label','code');
																	if (cells.external.val())
																	{
																		resolve((() => {
																			var res={};
																			for (var key in tab.fields.internal.parallelize)
																				((fieldInfo) => {
																					if (bst.field.typing(fieldInfo,tab.fields.external.parallelize[cells.external.val()])) res[fieldInfo.code]=fieldInfo;
																				})(tab.fields.internal.parallelize[key]);
																			cells.internal.assignOption(Object.values(res),'label','code');
																			return res;
																		})());
																	}
																	else resolve({});
																});
															};
														})({
															external:row.elm('[field-id=external]').elm('select'),
															internal:row.elm('[field-id=internal]').elm('select')
														});
													},(table,index) => {
														if (table.tr.length==0) table.addRow();
													},false),
													formula:{
														destination:bst.table.create(app.fields.formulaDestination,false,false,false).addClass('bst-mapping').spread((row,index) => {
															/* event */
															row.elm('.bst-table-row-add').on('click',(e) => {
																tab.tables.formula.destination.insertRow(row);
															});
															row.elm('.bst-table-row-del').on('click',(e) => {
																bst.confirm(bst.constants.common.message.confirm.delete[bst.operator.language],() => {
																	tab.tables.formula.destination.delRow(row);
																});
															});
															/* modify elements */
															((cells) => {
																cells.field.on('change',(e) => e.currentTarget.rebuild()).rebuild=(clear=true) => {
																	if (cells.field.val()) bst.formula.field.set(cells.formula,tab.fields.external.parallelize[cells.field.val()],clear);
																};
															})({
																field:row.elm('[field-id=field]').elm('select'),
																formula:row.elm('[field-id=formula]').elm('.bst-field-value')
															});
														},(table,index) => {
															if (table.tr.length==0) table.addRow();
														},false),
														source:bst.table.create(app.fields.formulaSource,false,false,false).addClass('bst-mapping').spread((row,index) => {
															/* event */
															row.elm('.bst-table-row-add').on('click',(e) => {
																tab.tables.formula.source.insertRow(row);
															});
															row.elm('.bst-table-row-del').on('click',(e) => {
																bst.confirm(bst.constants.common.message.confirm.delete[bst.operator.language],() => {
																	tab.tables.formula.source.delRow(row);
																});
															});
															/* modify elements */
															((cells) => {
																cells.field.on('change',(e) => e.currentTarget.rebuild()).rebuild=(clear=true) => {
																	if (cells.field.val()) bst.formula.field.set(cells.formula,tab.fields.internal.parallelize[cells.field.val()],clear);
																};
															})({
																field:row.elm('[field-id=field]').elm('select'),
																guide:row.elm('[field-id=guide]').css({width:'100%'}).parentNode.addClass('bst-mapping-guide'),
																formula:row.elm('[field-id=formula]').css({width:'450px'}).elm('.bst-field-value')
															});
														},(table,index) => {
															if (table.tr.length==0) table.addRow();
														},false)
													}
												};
												tab.panel.addClass('bst-scope').attr('form-id','form_'+app.id)
												.append(
													bst.config[PLUGIN_ID].ui.fields.users.set(bst.config[PLUGIN_ID].ui.fields.conditions.set(bst.create('div').addClass('bst-config-tabbed-panel-block'),app),app)
													.append(bst.create('h1').html(bst.constants.config.caption.event[bst.operator.language]))
													.append(
														bst.create('section')
														.append(bst.field.activate(((res) => {
															res.elms('[type=checkbox]').each((element,index) => {
																element.closest('label').elm('span').html(bst.constants.config.caption.event[element.val()][bst.operator.language]);
															});
															return res;
														})(bst.field.create(app.fields.event)),app))
													)
													.append(
														bst.create('section').addClass('bst-hidden')
														.append(bst.field.activate(((res) => {
															res.elm('select').empty().assignOption(([{code:'',label:''}]).concat(statusInfos.actions.map((item) => {
																return {code:item.key,label:item.name+'&nbsp;('+item.from+'&nbsp;&gt;&nbsp;'+item.to+')'};
															})),'label','code');
															return res;
														})(bst.field.create(app.fields.action)),app))
													)
													.append(bst.create('section').addClass('bst-hidden').append(bst.field.activate(bst.field.create(app.fields.label).css({width:'100%'}),app)))
													.append(bst.create('section').addClass('bst-hidden').append(bst.field.activate(bst.field.create(app.fields.message).css({width:'100%'}),app)))
													.append(
														bst.create('section').addClass('bst-hidden')
														.append(bst.field.activate(((res) => {
															res.elm('select').empty().assignOption(([{code:'',label:bst.constants.config.caption.view.all[bst.operator.language]}]).concat(viewInfos.list.map((item) => {
																return {code:item.id,label:item.name};
															})),'label','code');
															return res;
														})(bst.field.create(app.fields.view)),app))
													)
												)
												.append(bst.create('h1').html(bst.constants.config.caption.app.destination[bst.operator.language]))
												.append(
													bst.create('section')
													.append(((res) => {
														res.elm('select').empty().assignOption(([{appId:'',name:''}]).concat(appInfos),'name','appId').on('change',(e) => e.currentTarget.rebuild()).rebuild=() => {
															return new Promise((resolve,reject) => {
																((criteria,mapping,formula,filter,captions) => {
																	criteria.clearRows();
																	criteria.template.elm('[field-id=external]').css({width:'100%'}).elm('select').empty().assignOption([{code:'',label:''}],'label','code');
																	criteria.template.elm('[field-id=operator]').css({width:'100%'}).elm('select').empty();
																	criteria.template.elm('[field-id=internal]').css({width:'100%'}).elm('select').empty().assignOption([{code:'',label:''}],'label','code');
																	mapping.clearRows();
																	mapping.template.elm('[field-id=external]').css({width:'100%'}).elm('select').empty().assignOption([{code:'',label:''}],'label','code');
																	mapping.template.elm('[field-id=internal]').css({width:'100%'}).elm('select').empty().assignOption([{code:'',label:''}],'label','code');
																	mapping.template.elm('[field-id=guide]').css({width:'100%'}).parentNode.addClass('bst-mapping-guide');
																	formula.clearRows();
																	formula.template.elm('[field-id=field]').css({width:'100%'}).elm('select').empty().assignOption([{code:'',label:''}],'label','code');
																	formula.template.elm('[field-id=guide]').css({width:'100%'}).parentNode.addClass('bst-mapping-guide');
																	formula.template.elm('[field-id=formula]').css({width:'450px'});
																	if (res.elm('select').val())
																	{
																		bst.field.load(res.elm('select').val()).then((fieldInfos) => {
																			tab.fields.external=fieldInfos;
																			resolve(((app) => {
																				var res={
																					criteria:tab.fields.external.criterias,
																					mapping:((fieldInfos) => {
																						var res={};
																						for (var key in fieldInfos)
																							((fieldInfo) => {
																								if (!tab.fields.external.disables.includes(fieldInfo.code)) res[fieldInfo.code]=fieldInfo;
																							})(fieldInfos[key]);
																						return res;
																					})(tab.fields.external.parallelize),
																					formula:((fieldInfos) => {
																						var res={};
																						for (var key in fieldInfos)
																							((fieldInfo) => {
																								if (!tab.fields.external.disables.includes(fieldInfo.code))
																									if (!fieldInfo.tableCode)
																										if (fieldInfo.type!='FILE')
																											res[fieldInfo.code]=fieldInfo;
																							})(fieldInfos[key]);
																						return res;
																					})(tab.fields.external.parallelize)
																				};
																				criteria.template.elm('[field-id=external]').elm('select').assignOption(Object.values(res.criteria),'label','code');
																				mapping.template.elm('[field-id=external]').elm('select').assignOption(Object.values(res.mapping),'label','code');
																				formula.template.elm('[field-id=field]').elm('select').assignOption(Object.values(res.formula),'label','code');
																				criteria.addRow();
																				mapping.addRow();
																				formula.addRow();
																				filter.reset({id:app,fields:tab.fields.external.parallelize});
																				return res;
																			})(res.elm('select').val()));
																		});
																	}
																	else
																	{
																		criteria.addRow();
																		mapping.addRow();
																		formula.addRow();
																		filter.reset({id:null,fields:{}});
																		resolve({
																			criteria:{},
																			mapping:{},
																			formula:{}
																		});
																	}
																})(tab.tables.criteria,tab.tables.mapping,tab.tables.formula.destination,tab.panel.elm('[field-id=filter]').elm('.bst-field-value'),bst.constants.config.caption);
															});
														};
														return res;
													})(bst.field.activate(bst.field.create(app.fields.app),app)))
												)
												.append(bst.create('h1').html(bst.constants.config.caption.pattern[bst.operator.language]))
												.append(
													bst.create('section')
													.append(bst.field.activate(((res) => {
														res.elms('[data-name='+app.fields.pattern.code+']').each((element,index) => {
															element.closest('label').elm('span').html(bst.constants.config.caption.pattern[element.val()][bst.operator.language]);
														});
														return res;
													})(bst.field.create(app.fields.pattern)),app))
												)
												.append(bst.create('h1').hide().html(bst.constants.config.caption.criteria[bst.operator.language]))
												.append(
													bst.create('section').hide()
													.append(tab.tables.criteria)
													.append(bst.create('p').addClass('bst-caution').html(bst.constants.config.description.criteria[bst.operator.language]))
													.append(bst.create('p').html(bst.constants.config.caption.filter[bst.operator.language]))
													.append(bst.field.activate(bst.field.create(app.fields.filter).css({width:'100%'}),app))
												)
												.append(bst.create('h1').html(bst.constants.config.caption.mapping[bst.operator.language]))
												.append(
													bst.create('section')
													.append(tab.tables.mapping)
													.append(bst.create('p').addClass('bst-caution').html(bst.constants.config.description.mapping[bst.operator.language]))
												)
												.append(bst.create('h1').html(bst.constants.config.caption.formula[bst.operator.language]))
												.append(
													bst.create('section')
													.append(bst.create('h1').html(bst.constants.config.caption.app.destination[bst.operator.language]))
													.append(
														bst.create('section')
														.append(tab.tables.formula.destination)
														.append(bst.create('p').addClass('bst-caution').html(bst.constants.config.description.formula.destination[bst.operator.language]))
													)
													.append(bst.create('h1').html(bst.constants.config.caption.app.source[bst.operator.language]))
													.append(
														bst.create('section')
														.append(((table) => {
															table.template.elm('[field-id=field]').elm('select').empty().assignOption((() => {
																var res={};
																for (var key in tab.fields.internal.parallelize)
																	((fieldInfo) => {
																		if (!tab.fields.internal.disables.includes(fieldInfo.code))
																			if (!fieldInfo.tableCode)
																				if (fieldInfo.type!='FILE')
																					res[fieldInfo.code]=fieldInfo;
																	})(tab.fields.internal.parallelize[key]);
																return [{code:'',label:''}].concat(Object.values(res));
															})(),'label','code');
															return table;
														})(tab.tables.formula.source))
														.append(bst.create('p').addClass('bst-caution').html(bst.constants.config.description.formula.source[bst.operator.language]))
														.append(bst.create('p').html('&nbsp;'))
														.append(bst.create('p').addClass('bst-caution').html(bst.constants.config.description.formula.fixed[bst.operator.language]))
														.append(bst.create('p').addClass('bst-hint').html(bst.constants.config.description.formula.hint[bst.operator.language]))
														.append(
															bst.create('p').addClass('bst-hint').html(
																((anchor) => {
																	return bst.constants.config.description.formula.link[bst.operator.language]+'<br>'+anchor.outerHTML;
																})(
																	bst.create('a')
																	.attr('href','https://booooooost.com/'+bst.operator.language.substring(0,2)+'/functions.html')
																	.attr('target','_blank')
																	.html('https://booooooost.com/'+bst.operator.language.substring(0,2)+'/functions.html')
																)
															)
														)
													)
												);
												tab.panel.elm('[field-id=app]').elm('select').rebuild().then((fields) => {
													tab.tables.criteria.clearRows();
													tab.tables.mapping.clearRows();
													tab.tables.formula.destination.clearRows();
													tab.tables.criteria.addRow();
													tab.tables.mapping.addRow();
													tab.tables.formula.destination.addRow();
												});
												tab.tables.formula.source.addRow();
												/* event */
												bst.event.on('bst.change.event',(e) => {
													if (e.container==tab.panel)
													{
														tab.panel.elm('[field-id=action]').closest('section').addClass('bst-hidden');
														tab.panel.elm('[field-id=view]').closest('section').addClass('bst-hidden');
														tab.panel.elm('[field-id=label]').closest('section').addClass('bst-hidden');
														tab.panel.elm('[field-id=message]').closest('section').addClass('bst-hidden');
														if (e.record.event.value.includes('process')) tab.panel.elm('[field-id=action]').closest('section').removeClass('bst-hidden');
														if (e.record.event.value.includes('detail')) tab.panel.elm('[field-id=label]').closest('section').removeClass('bst-hidden');
														if (e.record.event.value.includes('detail')) tab.panel.elm('[field-id=message]').closest('section').removeClass('bst-hidden');
														if (e.record.event.value.includes('index')) tab.panel.elm('[field-id=label]').closest('section').removeClass('bst-hidden');
														if (e.record.event.value.includes('index')) tab.panel.elm('[field-id=message]').closest('section').removeClass('bst-hidden');
														if (e.record.event.value.includes('index')) tab.panel.elm('[field-id=view]').closest('section').removeClass('bst-hidden');
													}
													return e;
												});
												bst.event.on('bst.change.pattern',(e) => {
													if (e.container==tab.panel)
													{
														switch (e.record.pattern.value)
														{
															case 'insert':
																tab.tables.criteria.closest('section').hide().previousSibling.hide();
																break;
															default:
																tab.tables.criteria.closest('section').show().previousSibling.show();
																break;
														}
													}
													return e;
												});
												tab.panel.elms('input,select,textarea').each((element,index) => element.initialize());
											})({
												id:vars.app.id,
												fields:vars.app.fields.tab
											});
										},
										copy:(source,destination) => {
											((app) => {
												setup(destination,app,bst.record.get(source.panel,app,true).record);
											})({
												id:vars.app.id,
												fields:vars.app.fields.tab
											});
										},
										del:(index) => {}
									}
								);
								/* setup */
								if (Object.keys(config).length!=0)
								{
									((settings) => {
										settings.each((setting) => {
											if (!('formulaDestination' in setting.setting)) setting.setting.formulaDestination=setting.setting.formula;
											if (!('formulaSource' in setting.setting)) setting.setting.formulaSource={type:'SUBTABLE',value:[]};
											if (('formula' in setting.setting)) delete setting.setting.formula;
											((app,tab) => {
												setup(tab,app,setting.setting);
												tab.label.html(setting.label);
											})(
												{
													id:vars.app.id,
													fields:vars.app.fields.tab
												},
												bst.config[PLUGIN_ID].tabbed.add()
											);
										});
									})(JSON.parse(config.tab));
								}
								else
								{
									((tab) => {
										tab.panel.elm('[field-id=app]').elm('select').rebuild().then((fields) => {
											tab.tables.criteria.clearRows();
											tab.tables.mapping.clearRows();
											tab.tables.formula.destination.clearRows();
											tab.tables.criteria.addRow();
											tab.tables.mapping.addRow();
											tab.tables.formula.destination.addRow();
										});
									})(bst.config[PLUGIN_ID].tabbed.add());
								}
							}
							catch(error){bst.alert(bst.error.parse(error))}
						}
					);
				});
			});
		});
	});
})(kintone.$PLUGIN_ID);
/*
Message definition by language
*/
bst.constants=bst.extend({
	config:{
		caption:{
			action:{
				'en':'Action Name',
				'ja':'アクション名',
				'zh':'操作名称',
				'zh-TW':'操作名稱'
			},
			app:{
				destination:{
					'en':'Destination App for Copying or Updating',
					'ja':'コピーまたは更新先アプリ',
					'zh':'用于复制或更新的目标应用',
					'zh-TW':'用於複製或更新的目標應用'
				},
				source:{
					'en':'This App',
					'ja':'このアプリ',
					'zh':'此应用',
					'zh-TW':'此應用程式'
				}
			},
			criteria:{
				'en':'Record association for updates',
				'ja':'更新時のレコードの関連付け',
				'zh':'更新时的记录关联',
				'zh-TW':'更新時的記錄關聯'
			},
			destination:{
				'en':'Destination',
				'ja':'コピーまたは更新先アプリのフィールド',
				'zh':'复制或更新目标应用的字段',
				'zh-TW':'複製或更新目標應用的字段'
			},
			event:{
				'en':'Action Available Event',
				'ja':'動作イベント',
				'zh':'可操作事件',
				'zh-TW':'可操作事件',
				create:{
					'en':'After Record Creation Success',
					'ja':'レコード追加画面でのレコード保存成功後',
					'zh':'记录创建成功后',
					'zh-TW':'記錄創建成功後'
				},
				detail:{
					'en':'Clicking the button on the record detail page',
					'ja':'レコード詳細画面でのボタンクリック',
					'zh':'在记录详细页面上点击按钮',
					'zh-TW':'在記錄詳細頁面上點擊按鈕'
				},
				edit:{
					'en':'After Record Edit Success',
					'ja':'レコード編集画面でのレコード保存成功後',
					'zh':'记录编辑成功后',
					'zh-TW':'記錄編輯成功後'
				},
				index:{
					'en':'Bulk Execution from List View',
					'ja':'一覧画面からの一括実行',
					'zh':'从列表屏幕的批量执行',
					'zh-TW':'從列表畫面的批量執行'
				},
				process:{
					'en':'Process Action',
					'ja':'プロセスアクション',
					'zh':'过程操作',
					'zh-TW':'過程操作'
				}
			},
			filter:{
				'en':'Narrow it down further',
				'ja':'さらに絞り込む',
				'zh':'进一步缩小',
				'zh-TW':'進一步縮小'
			},
			formula:{
				'en':'Field to insert fixed values or calculation results',
				'ja':'固定値や計算結果を挿入するフィールド',
				'zh':'将固定值或计算结果插入的字段',
				'zh-TW':'將固定值或計算結果插入的字段',
				formula:{
					'en':'Fixed value or function',
					'ja':'固定値または関数',
					'zh':'固定值或函数',
					'zh-TW':'固定值或函數'
				}
			},
			label:{
				'en':'Execution Button Label',
				'ja':'実行ボタンのラベルテキスト',
				'zh':'执行按钮的标签名称',
				'zh-TW':'執行按鈕的標籤名稱'
			},
			mapping:{
				'en':'Copy or Update Field Mappings',
				'ja':'コピーまたは更新するフィールド',
				'zh':'复制或更新字段映射',
				'zh-TW':'複製或更新字段映射'
			},
			message:{
				'en':'Execution Confirmation Dialog Message',
				'ja':'実行確認ダイアログのメッセージ',
				'zh':'执行确认对话框的消息',
				'zh-TW':'執行確認對話框的消息'
			},
			pattern:{
				'en':'Pattern',
				'ja':'パターン',
				'zh':'模式',
				'zh-TW':'模式',
				insert:{
					'en':'Insert only',
					'ja':'コピーのみ',
					'zh':'仅复制',
					'zh-TW':'僅複製'
				},
				update:{
					'en':'Update only',
					'ja':'更新のみ',
					'zh':'仅更新',
					'zh-TW':'僅更新'
				},
				upsert:{
					'en':'Upsert',
					'ja':'更新出来なければコピー',
					'zh':'如果无法更新则复制',
					'zh-TW':'如果無法更新則複製'
				}
			},
			source:{
				'en':'Source',
				'ja':'このアプリのフィールド',
				'zh':'此应用的字段',
				'zh-TW':'此應用的字段'
			},
			view:{
				'en':'Executable List View',
				'ja':'実行可能な一覧画面',
				'zh':'可执行的列表屏幕',
				'zh-TW':'可執行的列表畫面',
				all:{
					'en':'No restrictions',
					'ja':'制限しない',
					'zh':'不限制',
					'zh-TW':'不限制'
				}
			}
		},
		description:{
			criteria:{
				'en':'When you specify your own app as the "Destination App for Copying or Updating" and link it to update the same record, please be cautious as unexpected errors might occur.',
				'ja':'「コピーまたは更新先アプリ」に自アプリを指定し、自レコードを更新するような関連付けをすると、予期せぬエラーが発生しますので、ご注意ください。',
				'zh':'当您指定自己的应用为“用于复制或更新的目标应用”并链接它以更新相同的记录时，请小心，因为可能会发生意外的错误。',
				'zh-TW':'當您指定自己的應用為“用於複製或更新的目標應用”並鏈接它以更新相同的記錄時，請小心，因為可能會發生意外的錯誤。'
			},
			formula:{
				destination:{
					'en':'This feature is not just for simply copying or updating. It is used when you want to copy or update based on calculated results from the field value. Please note that the field code you assign as a function argument will be the field on the destination app for copying or updating.',
					'ja':'この機能は、単純にコピーまたは更新するだけではなく、フィールドの値を元に計算した結果をコピーまたは更新したい場合に利用する機能になります。関数の引数として代入するフィールドコードはコピーまたは更新先アプリ側のフィールドになりますので、ご注意ください。',
					'zh':'这个功能不仅仅是为了简单地复制或更新。当您想要基于字段值的计算结果进行复制或更新时，您可以使用此功能。请注意，您作为函数参数分配的字段代码将是用于复制或更新的目标应用中的字段。',
					'zh-TW':'這個功能不僅僅是為了簡單地複製或更新。當您想要基於字段值的計算結果進行複製或更新時，您可以使用此功能。請注意，您作為函數參數分配的字段代碼將是用於複製或更新的目標應用中的字段。',
				},
				fixed:{
					'en':'When entering a fixed value, please enclose it in double quotes.',
					'ja':'固定値を入力する場合は、ダブルクォーテーションで囲うようにして下さい。',
					'zh':'当输入固定值时，请用双引号括起来。',
					'zh-TW':'當輸入固定值時，請用雙引號括起來。'
				},
				hint:{
					'en':'This feature can only be used for fields that do not belong to a table.',
					'ja':'この機能が使えるのはテーブルに属さないフィールドのみとなります。',
					'zh':'该功能只能用于不属于表格的字段。',
					'zh-TW':'該功能只能用於不屬於表格的字段。'
				},
				link:{
					'en':'You can refer to the available functions from the URL below.',
					'ja':'利用可能な関数は以下のURLから参照して下さい。',
					'zh':'您可以从下面的URL参考可用的功能。',
					'zh-TW':'您可以從下面的URL參考可用的功能。'
				},
				source:{
					'en':'This feature is used when you want to update the source record after copying or updating is complete, such as setting a "processed" flag. Please note that the field code you assign as a function argument will be the field on the source app.',
					'ja':'この機能は、コピーまたは更新完了後に「処理済」フラグを立てるなど、コピー元アプリのレコードを更新したい場合に利用する機能になります。関数の引数として代入するフィールドコードはコピー元アプリ側のフィールドになりますので、ご注意ください。',
					'zh':'此功能用于在复制或更新完成后更新复制源记录，例如设置“已处理”标志。请注意，您作为函数参数分配的字段代码将是复制源应用中的字段。',
					'zh-TW':'此功能用於在複製或更新完成後更新複製來源記錄，例如設置「已處理」標誌。請注意，您作為函數參數分配的欄位代碼將是複製來源應用中的欄位。'
				}
			},
			mapping:{
				'en':'This plugin not only allows for copying and updating between records, but also supports special transfers such as "merged transfer" which copies or updates from a record to a table, and "segmented transfer" which copies or updates from a table to a record. When performing operations that involve updates, it\'s essential to ensure proper associations, so please be cautious.',
				'ja':'本プラグインはレコード同士のコピーや更新だけではなく、レコードからテーブルへのコピーまたは更新を行う「結合転送」やテーブルからレコードへのコピーまたは更新を行う「分割転送」といった特殊な転送が可能となっておりますが、更新を伴う処理を行う場合は、関連付けが重要となりますので、ご注意ください。',
				'zh':'此插件不仅支持记录之间的复制和更新，还支持从记录到表的“合并传输”或从表到记录的“分割传输”等特殊传输。当执行涉及更新的操作时，确保适当的关联是非常重要的，所以请注意。',
				'zh-TW':'此插件不僅支持記錄之間的複製和更新，還支持從記錄到表的“合併傳輸”或從表到記錄的“分割傳輸”等特殊傳輸。當執行涉及更新的操作時，確保適當的關聯是非常重要的，所以請注意。'
			}
		},
		message:{
			invalid:{
				action:{
					'en':'If you specify "Process Action" for the action event, please indicate its action name.',
					'ja':'動作イベントに「プロセスアクション」を指定した場合は、そのアクション名を指定して下さい。',
					'zh':'如果在操作事件中指定了“过程操作”，请指定其操作名称。',
					'zh-TW':'如果在操作事件中指定了“過程操作”，請指定其操作名稱。'
				},
				criteria:{
					'en':'Please specify the record association for updates.',
					'ja':'更新時のレコードの関連付けを指定して下さい。',
					'zh':'请指定更新时的记录关联。',
					'zh-TW':'請指定更新時的記錄關聯。'
				},
				diversion:{
					'en':'When performing record division and transfer, it is not possible to specify fields from tables other than the table to which the field for division and transfer belongs as criteria for associating the records to be transferred',
					'ja':'レコードの分割転送を行う場合は、分割転送するフィールドが属するテーブル以外のテーブル内フィールドを転送するレコードの関連付けに指定することは出来ません',
					'zh':'在进行记录分割和传输时，不能将分割和传输字段所属表以外的表内字段指定为要传输记录的关联字段。',
					'zh-TW':'在進行記錄分割和傳輸時，不能將分割和傳輸欄位所屬表以外的表內欄位指定為要傳輸記錄的關聯欄位。'
				},
				dividing:{
					'en':'For the segmented transfer of records, the fields being segmented must belong to the same table.',
					'ja':'レコードの分割転送を行う場合は、分割転送するフィールドが同じテーブル内に属する必要があります。',
					'zh':'执行记录的分段传输时，需要分段的字段必须属于同一张表。',
					'zh-TW':'執行記錄的分段傳輸時，需要分段的字段必須屬於同一張表。'
				},
				formula:{
					'en':'Contains characters that cannot be used in the formula.',
					'ja':'計算式に使用出来ない文字が含まれています。',
					'zh':'表达式中包含无效字符。',
					'zh-TW':'表達式中包含無效字符。'
				},
				label:{
					detail:{
						'en':'If you specify "Clicking the button on the record detail page" for the action event, please input its execution button label.',
						'ja':'動作イベントに「レコード詳細画面でのボタンクリック」を指定した場合は、その実行ボタンのラベルテキストを入力して下さい。',
						'zh':'如果在操作事件中指定了“在记录详细页面上点击按钮”，请输入其执行按钮的标签名称。',
						'zh-TW':'如果在操作事件中指定了“在記錄詳細頁面上點擊按鈕”，請輸入其執行按鈕的標籤名稱。'
					},
					index:{
						'en':'If you specify "Bulk Execution from List View" for the action event, please input its execution button label.',
						'ja':'動作イベントに「一覧画面からの一括実行」を指定した場合は、その実行ボタンのラベルテキストを入力して下さい。',
						'zh':'如果在操作事件中指定了“从列表屏幕的批量执行”，请输入其执行按钮的标签名称。',
						'zh-TW':'如果在操作事件中指定了“從列表畫面的批量執行”，請輸入其執行按鈕的標籤名稱。'
					}
				},
				mapping:{
					'en':'Please specify the Field Mappings to Copy or Update.',
					'ja':'コピーまたは更新するフィールドを指定して下さい。',
					'zh':'请指定要复制或更新的字段映射。',
					'zh-TW':'請指定要複製或更新的字段映射。'
				},
				message:{
					detail:{
						'en':'If you specify "Clicking the button on the record detail page" for the action event, please input its execution confirmation dialog message.',
						'ja':'動作イベントに「レコード詳細画面でのボタンクリック」を指定した場合は、その実行確認ダイアログのメッセージを入力して下さい。',
						'zh':'如果在操作事件中指定了“在记录详细页面上点击按钮”，请输入其执行确认对话框的消息。',
						'zh-TW':'如果在操作事件中指定了“在記錄詳細頁面上點擊按鈕”，請輸入其執行確認對話框的消息。'
					},
					index:{
						'en':'If you specify "Bulk Execution from List View" for the action event, please input its execution confirmation dialog message.',
						'ja':'動作イベントに「一覧画面からの一括実行」を指定した場合は、その実行確認ダイアログのメッセージを入力して下さい。',
						'zh':'如果在操作事件中指定了“从列表屏幕的批量执行”，请输入其执行确认对话框的消息。',
						'zh-TW':'如果在操作事件中指定了“從列表畫面的批量執行”，請輸入其執行確認對話框的消息。'
					}
				},
				multiple:{
					'en':'You cannot specify fields from different tables for the record association for updates.',
					'ja':'更新時のレコードの関連付けに異なるテーブル内のフィールドを指定することは出来ません。',
					'zh':'无法为更新时的记录关联指定来自不同表的字段。',
					'zh-TW':'無法為更新時的記錄關聯指定來自不同表的欄位。'
				},
				unmatch:{
					'en':'When performing segmented record transfers, you need to specify a record association for updates that matches the segmented transfer.',
					'ja':'レコードの分割転送を行う場合は、更新時のレコードの関連付けにも分割転送に合致した関連付けを指定する必要があります。',
					'zh':'执行记录分段转移时，还需要为更新时的记录关联指定符合分段转移条件的关联。',
					'zh-TW':'執行記錄分段轉移時，還需要為更新時的記錄關聯指定符合分段轉移條件的關聯。'
				},
				various:{
					'en':'Combining fields from different tables to transfer to the same table is not possible.',
					'ja':'異なるテーブル内のフィールドを組み合わせて、同じテーブルに転送することは出来ません。',
					'zh':'不可以将不同表中的字段组合传输到同一张表。',
					'zh-TW':'不可以將不同表中的字段組合傳輸到同一張表。'
				}
			}
		}
	}
},bst.constants);
