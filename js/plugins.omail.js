/*
* FileName "plugins.omail.js"
* Version: 1.0.0
* Copyright (c) 2023 Pandafirm LLC
* Distributed under the terms of the GNU Lesser General Public License.
* https://opensource.org/licenses/LGPL-2.1
*/
"use strict";
((PLUGIN_ID) => {
	var vars={handlers:{}};
	var apply=(settings,record,silent=false) => {
		return new Promise((resolve,reject) => {
			var passphrase='';
			var recurse=(index,callback) => {
				var finish=() => {
					index++;
					if (index<settings.length) recurse(index,callback);
					else callback();
				};
				((setting) => {
					var result=bst.filter.scan(vars.app,record,setting.condition.value);
					if (result)
					{
						bst.filter.auth(setting.user.value,setting.organization.value,setting.group.value)
						.then((auth) => {
							if (auth)
							{
								var assign=(target,record,row) => {
									if (setting.format.value=='HTML') target=target.replace(/\r/g,'').replace(/\n/g,'<br>');
									for (var key in record)
									{
										var assignValue=record[key].value;
										if (key in vars.fieldInfos.parallelize)
										{
											if (setting.format.value=='HTML' && vars.fieldInfos.parallelize[key].type=='MULTI_LINE_TEXT') assignValue=assignValue.replace(/\r/g,'').replace(/\n/g,'<br>');
											target=target.replace(new RegExp('%'+key+'%','g'),bst.field.stringify(vars.fieldInfos.parallelize[key],assignValue,' / ',true));
										}
									}
									for (var key in row)
									{
										var assignValue=row[key].value;
										if (key in vars.fieldInfos.parallelize)
										{
											if (setting.format.value=='HTML' && vars.fieldInfos.parallelize[key].type=='MULTI_LINE_TEXT') assignValue=assignValue.replace(/\r/g,'').replace(/\n/g,'<br>');
											target=target.replace(new RegExp('%'+key+'%','g'),bst.field.stringify(vars.fieldInfos.parallelize[key],assignValue,' / ',true));
										}
									}
									return target;
								};
								((bodies) => {
									var send=(index,callback) => {
										((body) => {
											var download=(index,callback) => {
												if (body.attachment.length!=0)
												{
													var isReport=false;
													if (window.hasOwnProperty('bst_report_temp'))
														if (body.attachment[index].fileKey in window.bst_report_temp) isReport=true;
													if (!isReport)
													{
														bst.file.download(body.attachment[index],true)
														.then((resp) => {
															bst.field.blobToBase64(resp,(base64) => {
																body.attachment[index].data=base64;
																index++;
																if (index<body.attachment.length) download(index,callback);
																else callback();
															})
														})
														.catch((error) => {
															bst.alert(bst.error.parse(error));
															reject();
														});
													}
													else
													{
														body.attachment[index].data=window.bst_report_temp[body.attachment[index].fileKey];
														index++;
														if (index<body.attachment.length) download(index,callback);
														else callback();
													}
												}
												else callback();
											};
											download(0,() => {
												bst.encrypt(JSON.stringify(body.data),passphrase).then((encrypted) => {
													fetch(
														'https://api.booooooost.com/mail/oauth/'+bst.operator.language,
														{
															method:'POST',
															headers:{
																'X-Requested-With':'XMLHttpRequest'
															},
															body:JSON.stringify((() => {
																body.data=encrypted.data;
																body.iv=encrypted.iv;
																body.tag=encrypted.tag;
																return body;
															})())
														}
													)
													.then((response) => {
														response.json().then((json) => {
															switch (response.status)
															{
																case 200:
																	index++;
																	if (index<bodies.length) send(index,callback);
																	else callback();
																	break;
																default:
																	bst.alert(bst.error.parse(json));
																	reject();
																	break;
															}
														});
													})
													.catch((error) => {
														bst.alert(bst.error.parse(error));
														reject();
													});
												})
												.catch((error) => {
													reject();
												});
											});
										})(bodies[index]);
									};
									if (bodies.length!=0)
									{
										send(0,() => {
											try
											{
												setting.formula.value.map((item) => item.value).each((formula,index) => {
													if (formula.field.value in vars.fieldInfos.parallelize)
														((fieldInfo) => {
															if (!fieldInfo.tableCode)
															{
																result[fieldInfo.code].value=bst.formula.calculate(formula,result,result,record,vars.fieldInfos.parallelize);
																if (fieldInfo.lookup) result[fieldInfo.code].lookup=true;
																((id) => {
																	if (!(id in vars.formulaRecords)) vars.formulaRecords[id]={'$id':{value:id}};
																	vars.formulaRecords[id][fieldInfo.code]=result[fieldInfo.code];
																})(result['$id'].value);
															}
														})(vars.fieldInfos.parallelize[formula.field.value]);
												});
												finish();
											}
											catch(error)
											{
												bst.alert(bst.error.parse(error));
												reject();
											}
										});
									}
									else finish();
								})((() => {
									var res=[];
									((vars.fieldInfos.parallelize[setting.to.value].tableCode)?result[vars.fieldInfos.parallelize[setting.to.value].tableCode].value:[{value:result}]).each((record,index) => {
										if (record.value[setting.to.value].value)
											res.push({
												data:{
													client_id:setting.client_id.value,
													client_secret:setting.client_secret.value,
													author:setting.author.value,
													sender:setting.sender.value,
													subdomain:location.host.split('.')[0],
													provider:((provider) => {
														var res='';
														switch (setting.provider.value)
														{
															case 'GMail':
																res='google';
																break;
															case 'Exchange Online':
																res='microsoft';
																break;
														}
														return res;
													})(setting.provider.value),
													to:record.value[setting.to.value].value,
													cc:assign(setting.cc.value,result,(vars.fieldInfos.parallelize[setting.to.value].tableCode)?record.value:{}),
													bcc:assign(setting.bcc.value,result,(vars.fieldInfos.parallelize[setting.to.value].tableCode)?record.value:{}),
													html:(setting.format.value=='HTML')
												},
												subject:assign(setting.subject.value,result,(vars.fieldInfos.parallelize[setting.to.value].tableCode)?record.value:{}),
												body:assign(setting.body.value,result,(vars.fieldInfos.parallelize[setting.to.value].tableCode)?record.value:{}),
												attachment:(() => {
													var res=[];
													if (setting.attachment.value)
														if (setting.attachment.value in vars.fieldInfos.parallelize)
															res=((record) => {
																return record[setting.attachment.value].value;
															})(((vars.fieldInfos.parallelize[setting.attachment.value].tableCode)?record.value:result));
													return res;
												})()
											});
									});
									return res;
								})());
							}
							else finish();
						})
						.catch((error) => {
							bst.alert(bst.error.parse(error));
							reject();
						});
					}
					else finish();
				})(settings[index]);
			};
			fetch(
				'https://api.booooooost.com/mail/oauth/'+bst.operator.language,
				{
					method:'GET',
					headers:{
						'X-Requested-With':'XMLHttpRequest'
					}
				}
			)
			.then((response) => {
				response.json().then((json) => {
					switch (response.status)
					{
						case 200:
							passphrase=json.passphrase;
							if (!silent) bst.loadStart();
							recurse(0,() => {
								if (!silent) bst.loadEnd();
								resolve();
							});
							break;
						default:
							bst.alert(bst.error.parse(json));
							reject();
							break;
					}
				});
			})
			.catch((error) => {
				bst.alert(bst.error.parse(error));
				reject();
			});
		});
	};
	kintone.events.on([
		'app.record.create.submit.success',
		'app.record.detail.show',
		'app.record.edit.submit.success',
		'app.record.index.show',
		'mobile.app.record.create.submit.success',
		'mobile.app.record.detail.show',
		'mobile.app.record.edit.submit.success',
		'mobile.app.record.index.show'
	],(e) => {
		return new Promise((resolve,reject) => {
			((mobile,type) => {
				vars.mobile=mobile;
				vars.type=type;
				for (var key in vars.handlers)
					vars.handlers[key].each((handler,index) => {
						kintone.events.off(key,handler);
					});
				/* get config */
				bst.config[PLUGIN_ID].config.get()
				.then((config) => {
					if (Object.keys(config).length!=0)
					{
						bst.field.load(bst.config[PLUGIN_ID].app,true).then((fieldInfos) => {
							vars.app={
								id:bst.config[PLUGIN_ID].app,
								fields:fieldInfos.origin
							}
							vars.fieldInfos=fieldInfos;
							vars.formulaRecords={};
							try
							{
								if (['detail'].includes(vars.type))
								{
									kintone.app.record.getPermissions().then((resp) => {
										if (resp.editRecord)
										{
											((settings) => {
												if (settings.length!=0)
												{
													((types,handler) => {
														kintone.events.on(types,handler);
														types.each((type,index) => {
															if (!(type in vars.handlers)) vars.handlers[type]=[];
															vars.handlers[type].push(handler);
														});
													})(
														['app.record.detail.process.proceed','mobile.app.record.detail.process.proceed'],
														(e) => {
															return new Promise((resolve,reject) => {
																try
																{
																	((settings) => {
																		if (settings.length!=0) apply(settings,e.record).then((resp) => resolve(e)).catch(() => {});
																		else resolve(e);
																	})(settings.filter((item) => item.action.value==e.action.value+':'+e.status.value+':'+e.nextStatus.value));
																}
																catch(error)
																{
																	bst.alert(bst.error.parse(error));
																	resolve(e);
																}
															});
														}
													);
												}
											})(JSON.parse(config.tab).map((item,index) => bst.extend({sIndex:{value:index.toString()}},item.setting)).reduce((result,current) => {
												if (((vars.mobile)?['all','both','mobile']:['all','both','pc']).includes(current.device.value) && current.event.value.includes('process')) result.push(current);
												return result;
											},[]));
										}
									}).catch(() => {});
								}
								((settings) => {
									if (settings.length!=0)
									{
										var finish=(callback) => {
											if (Object.keys(vars.formulaRecords).length!=0)
											{
												bst.view.records.set(vars.app.id,{put:Object.values(vars.formulaRecords).map((item) => bst.view.records.transform(item))},false)
												.then((resp) => callback())
												.catch((error) => bst.alert(bst.error.parse(error)));
											}
											else callback();
										};
										switch (vars.type)
										{
											case 'create':
											case 'edit':
												apply(settings,e.record).then((resp) => finish(() => resolve(e))).catch(() => {});
												break;
											case 'detail':
												var recurse=(index) => {
													((setting) => {
														if (bst.filter.scan(vars.app,e.record,setting.condition.value))
														{
															bst.filter.auth(setting.user.value,setting.organization.value,setting.group.value)
															.then((auth) => {
																if (auth)
																{
																	bst.button.create(
																		vars.mobile,
																		vars.type,
																		'bst-mail-button'+index.toString(),
																		setting.label.value,
																		setting.message.value,
																		() => apply([setting],e.record).then((resp) => finish(() => bst.alert('Done!',() => window.location.reload(true)))).catch(() => {})
																	);
																}
																index++;
																if (index<settings.length) recurse(index);
															})
															.catch((error) => {
																index++;
																if (index<settings.length) recurse(index);
															});
														}
														else
														{
															index++;
															if (index<settings.length) recurse(index);
														}
													})(settings[index]);
												};
												recurse(0);
												resolve(e);
												break;
											case 'index':
												var recurse=(index) => {
													((setting) => {
														bst.filter.auth(setting.user.value,setting.organization.value,setting.group.value)
														.then((auth) => {
															if (auth)
															{
																if (!setting.view.value || setting.view.value==e.viewId.toString())
																	bst.button.create(
																		vars.mobile,
																		vars.type,
																		'bst-mail-button'+index.toString(),
																		setting.label.value,
																		setting.message.value,
																		() => {
																			bst.view.records.get(
																				vars.app.id,
																				((vars.mobile)?kintone.mobile.app:kintone.app).getQueryCondition()
																			)
																			.then((records) => {
																				let deepRecurse=(index,callback) => {
																					apply([setting],records[index],true)
																					.then((resp) => {
																						bst.progressUpdate();
																						index++;
																						if (index<records.length) deepRecurse(index,callback);
																						else callback();
																					})
																					.catch(() => {});
																				};
																				if (records.length!=0)
																				{
																					bst.progressStart(records.length);
																					deepRecurse(0,() => finish(() => bst.alert('Done!',() => window.location.reload(true))));
																				}
																				else bst.alert('There are no records.');
																			})
																			.catch((error) => bst.alert(bst.error.parse(error)))
																		});
															}
															index++;
															if (index<settings.length) recurse(index);
														})
														.catch((error) => {
															index++;
															if (index<settings.length) recurse(index);
														});
													})(settings[index]);
												};
												recurse(0);
												resolve(e);
												break;
										}
									}
									else resolve(e);
								})(JSON.parse(config.tab).map((item,index) => bst.extend({sIndex:{value:index.toString()}},item.setting)).reduce((result,current) => {
									if (((vars.mobile)?['all','both','mobile']:['all','both','pc']).includes(current.device.value) && current.event.value.includes(vars.type)) result.push(current);
									return result;
								},[]));
							}
							catch(error)
							{
								bst.alert(bst.error.parse(error));
								resolve(e);
							}
						})
						.catch((error) => resolve(e));
					}
					else resolve(e);
				})
				.catch((error) => resolve(e));
			})(
				e.type.split('.').first()=='mobile',
				((type) => {
					switch (type)
					{
						case 'submit':
							type=e.type.split('.').slice(-3).first();
							break;
					}
					return type;
				})(e.type.split('.').slice(-2).first())
			);
		});
	});
	bst.event.on('bst.omail.call',(e) => {
		return new Promise((resolve,reject) => {
			/* get config */
			bst.config[PLUGIN_ID].config.get()
			.then((config) => {
				if (Object.keys(config).length!=0)
				{
					bst.field.load(bst.config[PLUGIN_ID].app,true).then((fieldInfos) => {
						vars.app={
							id:bst.config[PLUGIN_ID].app,
							fields:fieldInfos.origin
						}
						vars.fieldInfos=fieldInfos;
						vars.formulaRecords={};
						try
						{
							((settings) => {
								if (settings.length!=0) apply(settings,e.record,true).then((resp) => resolve(e)).catch(() => resolve(e));
								else resolve(e);
							})(JSON.parse(config.tab).map((item,index) => bst.extend({sIndex:{value:index.toString()}},item.setting)).reduce((result,current) => {
								if (((e.mobile)?['all','both','mobile']:['all','both','pc']).includes(current.device.value) && current.event.value.includes(e.pattern)) result.push(current);
								return result;
							},[]));
						}
						catch(error)
						{
							bst.alert(bst.error.parse(error));
							resolve(e);
						}
					})
					.catch((error) => resolve(e));
				}
				else resolve(e);
			})
			.catch((error) => resolve(e));
		});
	});
})(kintone.$PLUGIN_ID);
