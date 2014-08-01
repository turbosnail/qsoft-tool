var options = {
			UserID: false,
			jQuery: false,
			TicketModal: false,
			Clip: false,
			OptionsData: {
				'Общие' : {
					escape: {type: 'checkbox', name: 'Включить скрытие "Статуса" клавишей "ESC"', default: 'Y'},
					ajaxMessage: {type: 'checkbox', name: 'Выводить последнее сообщение, при наведении на номер тикета?', default: 'Y'},
					autoLoadTicket: {type: 'checkbox', name: 'Загружать и кешировать последние сообщения из тикетов?', default: 'Y'},
					autoReLoadTicket: {type: 'checkbox', name: 'Включить автоматическое обновление последних сообщений, раз в 2 мин?', default: 'Y'}
				},
				'Дизайн' : {
					newmenu: {type: 'checkbox', name: 'Использовать новое меню', default: 'Y'},
					fixnewmenu: {type: 'checkbox', name: 'Зафиксировать новое меню с верху', default: 'Y'},
					autoGroup: {type: 'checkbox', name: 'Группировать тикеты автоматически?', default: 'Y'},
					color: {type: 'text', name: 'Цвет тикета ответсвенный', default: '', style: {}}
				}
			},

			init: function( options ){

			   this.jQuery = $.noConflict();
			   this.StartLoadingPage();

			   this.InitOtherObjects();

			   this.reDesignLogin();
			   this.AddOptions();
			   this.reDesignHead();
			   this.reDesignSubmit();
			   this.reDesignTable();
			   this.reDesignFooter();
			   this.AddButtons();
			   this.AddBindData();
			   this.GroupTicket();

			   this.StopLoadingPage();
			},
			reDesignLogin : function(){
				if(window.location.pathname != '/support/wbs.php')
					return false;

				this.jQuery('head').append('<link href="'+ chrome.extension.getURL('css') +'/auth.css" type="text/css" rel="stylesheet" />');
				this.jQuery('body *').hide();
				this.jQuery('body').append('<div class="container"></div>');

				this.jQuery('body div.container').append('<form class="form-signin" action="/support/wbs.php?login=yes" role="form"></form>');
				this.jQuery('body div.container form').append('<input type="hidden" name="AUTH_FORM" value="Y" />');
				this.jQuery('body div.container form').append('<input type="hidden" name="TYPE" value="AUTH" />');
				this.jQuery('body div.container form').append('<h2 class="form-signin-heading">Авторизация</h2>');

				if(this.jQuery('.message-error .message-title').length > 0)
					this.jQuery('body div.container form').append('<div class="alert alert-danger" role="alert">'+this.jQuery('span.message-title').parent('td').text().replace(this.jQuery('table.message-error span.message-title').text(), '') +'</div>');

        		this.jQuery('body div.container form').append('<input type="text" name="USER_LOGIN" value="'+ this.jQuery('input[name=USER_LOGIN]').val()+'" class="form-control" placeholder="Логин" required autofocus>');
        		this.jQuery('body div.container form').append('<input type="password" name="USER_PASSWORD" class="form-control" placeholder="Пароль" required>');
        		this.jQuery('body div.container form').append('</div>');
        		this.jQuery('body div.container form').append('<button class="btn btn-lg btn-primary btn-block" name="Login" type="submit">Войти</button>');

        		// this.jQuery('body div.container').next('*').remove();
			},

			StartLoadingPage : function(){
				NProgress.start();
			},

			StopLoadingPage : function(){
				NProgress.done();
			},

			InitOtherObjects : function(){
			},

			AddOptions : function(){
				this.jQuery('.qsoft_tmpl_top_menu').children('ul').append('<a id="QToolOptions" href="#myModal" role="button" data-toggle="modal">QTool</a>');
				this.jQuery('#QToolOptions').addClass('qsoft_tmpl_top_menu_tab').wrap('<li class="qsoft_tmpl_top_menu_tab_box qsoft_tmpl_top_menu_tab_box_3 qsoft_link"></li>');
				this.jQuery('#QToolOptions').parent('li').append('<span class="qsoft_tmpl_png_for_ie2"></span>');

				if( window.location.pathname == "/bitrix/admin/oper_day.php")
					this.UserID = this.jQuery("a.thickbox.group_link").attr("href").replace(/^(.+)responsible=(\d+)&(.+)$/,'$2');

				this.ChangeOptions();
			},

			reDesignHead : function(){
				if(localStorage.getItem('newmenu') != 'Y') return false;

				if(  window.location.pathname == "/bitrix/admin/ticket_edit.php"  ){

					this.jQuery("td.toppanel").hide();
					var tID =  this.jQuery('h1').text().replace(/^(.*) (\d+)/, "$2");
					var tName = this.jQuery('td.title').hide().text();
					this.jQuery('td.toppanel').before('<div class="navbar"></div>');
					this.jQuery('.navbar').append('<div class="navbar-inner" style="height: 40px;"><div class="container" style="width: 98%;"><a class="brand" href="' + location.href + '" style="padding-top: 8px;" title="Обновить страницу"><strong>QSOFT Task</strong></a></div></div>');
					this.jQuery('.navbar .container').append('<div class="nav-collapse collapse navbar-responsive-collapse" id="navigationContainer"><ul class="nav" role="navigation"><li class="active" style="padding-top: 10px; font-size: 19px;font-weight: bolder;font-family: Tahoma;font-style: italic;color: gray;"><span id="nameTitle">'+tID+' / '+tName+'</span>  <button id="click-to-copy">(Скопировать)</button></li></ul></div>')

					// ПЕРВЫЙ ВАРИАНТ: Текст задается программно
					this.jQuery("#click-to-copy").on('click', function(){
						var input = document.getElementById( 'url' );
  						input.value = 'dsadsadsadsadsas';
  						input.focus();
  						input.select();
  						document.execCommand( 'Copy' );
					});

				} else {

					this.jQuery('.qsoft_tmpl_top_box').hide();
					this.jQuery('.qsoft_tmpl_top_box').before('<div class="navbar"></div>');
					this.jQuery('.navbar').append('<div class="navbar-inner"><div class="container" style="width: 98%;"><a class="brand" href="' + location.href + '" style="padding-top: 12px;" title="Обновить страницу"><strong>QSOFT Task</strong></a></div></div>');
					this.jQuery('.navbar .container').append('<div class="nav-collapse collapse navbar-responsive-collapse" id="navigationContainer"><ul class="nav" role="navigation"></ul></div>');

					this.jQuery('.qsoft_tmpl_top_box ul li').each(function(){
						if(!options.jQuery(this).hasClass('qsoft_link')){

							var text = '<li>' + options.jQuery(this).html() + '</li>';
							if(options.jQuery(this).hasClass('qsoft_tmpl_top_menu_tab_active'))
								text = '<li class="active">' + options.jQuery(this).html() + '</li>';

							options.jQuery('.navbar .container ul.nav').append(text);
						}
					});
					this.jQuery('#navigationContainer').append('<ul class="nav pull-right"><li style="margin: 0;"><a id="QToolOptions" href="#myModal" role="button" data-toggle="modal">QTool</a></li></ul>');
					this.jQuery('#navigationContainer ul.pull-right').append('<li style="margin: 0;"><a href="/support/wbs.php?logout=yes" role="button">Выход</a></li>');
				}


				if(localStorage.getItem('fixnewmenu') == 'Y')
					this.jQuery('.navbar').addClass('navbar-fixed-top');


				this.jQuery('#qsoft_task_all_users').next('div').append('<br /><strong> Сегодня : </strong>' + this.jQuery('td.curWeekDay').text());
			},

			reDesignFooter : function(){
				this.jQuery('.qsoft_bottom_box div').append(' Redisign by mvolkov dkostin vpyankov');
			},

			ChangeOptions : function(){
				this.jQuery('body').append('<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
										  +'<div class="modal-header">'
										  +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
										  +'<h3 id="myModalLabel">Настройки QTool</h3>'
										  +'</div>'
										  +'<div class="modal-body"><div class="tabbable">'
										  +'<ul class="nav nav-tabs"></ul><div class="tab-content"></div>'
										  +'</div></div>'
										  +'<div class="modal-footer">'
										  +'<button name="okeyClose" class="btn" data-dismiss="modal" aria-hidden="true">Закрыть</button>'
										  +'</div>'
										  +'</div>'
					);

				var i = 0;
				this.jQuery.each(this.OptionsData, function(key, value){
					i++;
					var TabID = 'tabas' + i;

					var active = 'active';
					if(i > 1)
						active = '';

					options.jQuery('#myModal ul.nav-tabs').append('<li class="' + active + '"><a href="#' + TabID + '" data-toggle="tab">' + key + '</a></li>');
					options.jQuery('#myModal div.tab-content').append('<div class="tab-pane ' + active + '" id="'+ TabID +'"><table class="table"></table></div>');
						options.jQuery.each(options.OptionsData[key], function(keys, values){
							options.jQuery('div#' + TabID + ' table').append('<tr><td><label for="' + keys +'">' + values.name +'</label></td><td><input type="' + values.type +'" name="' + keys + '" id="' + keys + '" value="'+ values.default +'" /></td></tr>');


							if(values.style != undefined)
								options.jQuery('input[name=' + keys +']').css(values.style);

							if( localStorage.getItem(keys) == 'Y')
								options.jQuery('input[name=' + keys + ']').attr('checked', 'checked');
							else if(values.type = 'text')
								options.jQuery('input[name=' + keys + ']').val(localStorage.getItem(keys));



							if( keys == 'fixnewmenu'){
								var parent = options.jQuery('input[name='+ keys +']').parent('td').parent('tr');
								parent.show(250);
								options.jQuery('input[name=newmenu]').bind('change', function(){
									if(options.jQuery(this).is(':checked'))
										parent.show(250);
									else
										parent.hide(250);
								});
								if(localStorage.getItem('newmenu') != 'Y'){
									parent.hide(250);
								}
							}
						});
				});

				this.jQuery('input[name=color]').colorPicker();

				this.jQuery('input').on('change', function(){
					if(options.jQuery(this).attr('type') == 'checkbox'){
						if(options.jQuery(this).is(':checked')){
							localStorage.setItem(options.jQuery(this).attr('name'), 'Y');
						} else {
							localStorage.setItem(options.jQuery(this).attr('name'), 'N');
						}
					} else {
							localStorage.setItem(options.jQuery(this).attr('name'), options.jQuery(this).val());
					}
				});

				this.jQuery('button[name=okeyClose]').on('click', function(){

							if(localStorage.getItem('autoGroup') == 'Y' && options.GetParam('group_by_sla') == 0)
								window.location.href = '/bitrix/admin/oper_day.php?group_by_sla';
							else if(localStorage.getItem('autoGroup') == 'N' && options.GetParam('group_by_sla') != 0)
								window.location.href = '/bitrix/admin/oper_day.php';

							if(localStorage.getItem('newmenu') == 'Y'){
								if(!options.jQuery('.navbar').length)
									options.reDesignHead();
							} else {
								options.jQuery('.qsoft_tmpl_top_box').show();
								options.jQuery('.navbar').remove();
							}

							if(localStorage.getItem('fixnewmenu') == 'Y'){
								if(!options.jQuery('.navbar').hasClass('navbar-fixed-top'))
									options.jQuery('.navbar').addClass('navbar-fixed-top');
							} else {
								if(options.jQuery('.navbar').hasClass('navbar-fixed-top'))
									options.jQuery('.navbar').removeClass('navbar-fixed-top');
							}

							if(localStorage.getItem('color') != options.jQuery('td.qChangeColor').css('background-color'))
								options.jQuery('td.qChangeColor').css('background-color', localStorage.getItem('color'));

				});
			},

			reDesignSubmit : function() {
				this.jQuery('input[value=open_day], input[value=update_day]').next('input').addClass('btn').addClass('btn-primary');
			},

			reDesignTable : function() {

				this.jQuery('pre.aim_oper_day').each(function(){
					if( options.jQuery( this ).html().length == 0 ){
						options.jQuery( this ).hide();
					}
				});



			},

			AddButtons : function(){
				this.jQuery('input[name=dinner_minute]').parent().append('<button id="ClearTime" style="margin-top: -11px;" class="btn btn-danger" title="Очистить">[X]</button>');
				this.jQuery('input[name=end_minute]').parent().append('<button id="FillTime" style="margin-top: -11px; margin-left:2px;"class="btn btn-inverse"  title="Подсчитать">[O]</button>');
				this.jQuery('#ClearTime').tooltip();
				this.jQuery('#FillTime').tooltip();
			},

			AddBindData : function(){
				this.jQuery('#ClearTime').on('click', function(){
					options.ClearTime(this);

					return false;
				});

				this.jQuery('#FillTime').on('click', function(){
					options.CalcTime(this);

					return false;
				});

				this.jQuery('form input[type=text]').on('keydown', function( e ){
					if( e.keyCode == 13 && window.location.pathname == "/bitrix/admin/oper_day.php")
						options.jQuery('form').submit();
				});

				this.offChangeStatus();

				if( this.jQuery('input[type=submit]').val() == 'Изменить день' ){
					this.ajaxGetData();
					if(localStorage.getItem('autoReLoadTicket') == 'Y')
						setInterval('options.ajaxGetData();', 2*60*1000);
				}
			},

			ClearTime : function(obj){
					this.jQuery('input[name=dinner_hour], input[name=dinner_minute], input[name=end_hour], input[name=end_minute]').val('');
			},

			CalcTime : function( obj ){
				var start_hour = options.jQuery('input[name=start_hour]').val();
				var start_minute = options.jQuery('input[name=start_minute]').val();
				var spend_hour = 0;
				var spend_minute = 0;

				options.jQuery('input[name^=hour]').each(function(){
					if( options.jQuery(this).val() > 0){
						spend_hour += parseInt( options.jQuery(this).val() );
					}
				});
				options.jQuery('input[name^=minute]').each(function(){
					if( options.jQuery(this).val() > 0){
						spend_minute += parseInt( options.jQuery(this).val() );
						if( spend_minute >= 60 ){
							spend_hour++;
							spend_minute -= 60;
						}
					}
				});

				var currentTime = new Date();
				var currentHours = currentTime.getHours();
				var currentMinutes = currentTime.getMinutes();

				currentMinutes = 10*(parseInt(currentMinutes/10) + 1);

				if( currentMinutes >= 60 ){
					currentHours++;
					currentMinutes -= 60;
				}

				var dinner_hour = currentHours - start_hour - spend_hour;
				var dinner_minute = currentMinutes - start_minute - spend_minute;

				if( dinner_minute < 0 ){
					dinner_hour--;
					dinner_minute += 60;
				}

				options.jQuery('input[name=dinner_hour]').val( dinner_hour );
				options.jQuery('input[name=dinner_minute]').val( dinner_minute );
				options.jQuery('input[name=end_hour]').val( currentHours );
				options.jQuery('input[name=end_minute]').val( currentMinutes );
			},

			offChangeStatus : function(){

				this.jQuery('input[name^="hour["], input[name^="minute["]').each(function(){

					var id = this.name.replace(/^\w+\[(\d+)\]$/,'$1');
					options.jQuery(this).removeAttr('onkeydown');
					options.jQuery(this).on('keydown', function(){
					   options.jQuery("#statusSelector\\[" + id + "\\]").show();
					});

				});

				this.jQuery(document).on('keydown', function(e) {
					if (e.keyCode == 27 && localStorage.getItem('escape') == 'Y') {
						options.jQuery('div.qsoft_status_selector_box').hide();
					}
				});
			},

			ajaxGetData : function(){
				this.jQuery('#TASK_TABLE tr:gt(2)').each(function(){
					options.jQuery(this).find('td.mainTable:eq(2) a:first').addClass('ticket_link');
				});

				if(localStorage.getItem('autoLoadTicket') == 'Y')
					this.GetLoadTicket();

				this.jQuery('a.ticket_link').on('mouseover', function(){
					ticket_id = options.jQuery(this).text();
					pos = options.jQuery(this).offset();

					if(localStorage.getItem('autoLoadTicket') != 'Y')
						options.GetAjaxTicket(ticket_id);

					options.jQuery('#num_' + ticket_id).css({'top' : parseInt(pos['top']) + 13, 'left' : parseInt(pos['left']) + 15}).show();

					delete ticket_id;
					delete pos;
				}).on('mouseout', function(){
					ticket_id = options.jQuery(this).text();
					options.jQuery('#num_'+ticket_id).hide();
					delete ticket_id;
				});
			},
			GetLoadTicket: function(){
				this.jQuery('a.ticket_link').each(function(){
			   			ticket_id = options.jQuery(this).text();
						options.jQuery(this).parent().parent().attr('ticket_id', ticket_id);
						options.GetAjaxTicket(ticket_id);
						delete ticket_id;
					});
			},
			GetAjaxTicket: function(ticket_id){
					-	options.jQuery.ajax({
							type: "GET",
							url: "http://www.corp.qsoft.ru/bitrix/admin/ticket_edit.php",
							async: true,
							cache: true,
							data: "ID="+parseInt(ticket_id)+"&lang=ru&work_type=dev",
							dataType: "html",
							success: function(page){
								LastMessage = options.jQuery(page).find('a[name^="m"]:last').parents('table:first');
								options.jQuery(LastMessage).find('tr:first td:last').empty();

								if(LastMessage == undefined)
									return false;

								if(!options.jQuery('#num_'+ticket_id).length)
									options.jQuery('body').append('<div id="num_'+ticket_id+'"></div>');

								options.jQuery('#num_'+ticket_id).css({'display' : 'none', 'position' : 'absolute', 'left' :' 0px; top: 0px', 'z-index': 1000});
								options.jQuery('#num_'+ticket_id).html( '<table style="border:1px solid #A1A8A5;" cellspacing="0" cellpadding="0">'+options.jQuery(LastMessage).html()+'</table>' );

								IsResponsible = options.jQuery(page).find('select#RESPONSIBLE_USER_ID option:selected').val() == options.UserID;

								if( IsResponsible ){
									var thisColor = localStorage.getItem('color');
									if(thisColor == undefined)
										thisColor = "#FF88AA";

									options.jQuery("td[ticket_id="+ticket_id+"]").css("background-color", thisColor).addClass('qChangeColor');
								}else{
									color = options.jQuery("td[ticket_id="+ticket_id+"]").parent().find("td:first").css("background-color");
									options.jQuery("td[ticket_id="+ticket_id+"]").css("background-color", color).removeClass('qChangeColor');
									delete color;
								}

								delete IsResponsible;
								delete LastMessage;
								delete page;
							}
						});
			},
			GroupTicket : function(){
				if(localStorage.getItem('autoGroup') != 'Y') return false;
				if(window.location.pathname != '/bitrix/admin/oper_day.php') return false;

				if(options.GetParam('group_by_sla') == 0){
					window.location.href = '/bitrix/admin/oper_day.php?group_by_sla';
					options.jQuery('form').attr('action','/bitrix/admin/oper_day.php?group_by_sla');
					options.jQuery('li.qsoft_tmpl_top_menu_tab_active a').attr('href','/bitrix/admin/oper_day.php?group_by_sla');
				}

			},
			ChangeIcons : function(){

			},
			GetParam : function(name){
				var $_GET = {};
				var __GET = window.location.search.substring(1).split("&");
	
				for(var i=0; i<__GET.length; i++) {
					var getVar = __GET[i].split("=");
					$_GET[getVar[0]] = typeof(getVar[1]) == "undefined" ? "y" : getVar[1];
				}
	
				return $_GET[name] || 0;
			},

	};


	options.init();