
Application = bliss.Class.extend({
	
	initialize: function() {
		
		this.items = [];
		this.initializeSources();
		this.initializeSystem();
		this.loadSystem(function() {
			console.log('ok');
			console.log('this.system.contexts.length: ' + this.system.contexts.length);
			this.runInterval();
		}.bind(this));
	},
	
	initializeSources: function() {
		
		if (window.location.hostname == '127.0.0.1') {
			console.log('running locally');
			this.sources = [
				'http://127.0.0.1:8082/wiki/Worship.md',
				'http://127.0.0.1:8082/wiki/Fun.md',
				'http://127.0.0.1:8082/wiki/Hours.md',
				'http://127.0.0.1:8082/wiki/Personal.md',
				'http://127.0.0.1:8082/wiki/Live-Music.md',
				'http://127.0.0.1:8082/wiki/Recovery.md',
				'http://127.0.0.1:8082/wiki/Tech.md',
				'http://127.0.0.1:8082/wiki/Program.md',
				'http://127.0.0.1:8082/wiki/Scripture.md',
				'http://127.0.0.1:8082/wiki/Cycling.md'
			];
		} else {
			console.log('running remotely');
			this.sources = [
				'http://127.0.0.1:8082/wiki/Worship.md',
				'http://127.0.0.1:8082/wiki/Fun.md',
				'http://127.0.0.1:8082/wiki/Hours.md',
				'http://127.0.0.1:8082/wiki/Personal.md',
				'http://127.0.0.1:8082/wiki/Live-Music.md',
				'http://127.0.0.1:8082/wiki/Recovery.md',
				'http://127.0.0.1:8082/wiki/Tech.md',
				'http://127.0.0.1:8082/wiki/Program.md',
				'http://127.0.0.1:8082/wiki/Scripture.md',
				'http://127.0.0.1:8082/wiki/Cycling.md'
			];
		}
	},
	
	initializeSystem: function() {
		
		system = new System();
		this.system = system;
	},
	
	loadSystem: function(done) {
		
		this.loader = new Loader.Basic({
			system: this.system
		});
		var sources = JSON.parse(JSON.stringify(this.sources));
		this.loader.load(sources, function() {
			console.log('loader loaded');
			Broadcast.publish('loaded', {});
			done();
		}.bind(this));
	},
	
	runInterval: function() {
		
		var date = new Date();
		if (false) date = new Date(2019, 0, 1);
		var array = dateFns.eachDayOfInterval({
			start: date,
			end: dateFns.addDays(date, 60),
		});
		array.forEach(
			function(each) {
				this.run(each);
			}.bind(this)
		);
	},
	
	run: function(date) {
		
		var result = this.system.test(date);
		result.sort(
			function(a, b) {
				return a.data.time.begin.getTime() - b.data.time.begin.getTime();
			}.bind(this)
		);
		var array = [];
		result.forEach(
			function(each) {
				if (each.data.time.begin) {
					array.push({
						name: each.data.as,
						time: each.data.time.begin,
						begin: true,
					});
				}
				if (each.data.time.end) {
					array.push({
						name: each.data.as,
						time: each.data.time.end,
						begin: false,
					});
				}
			}.bind(this)
		);
		array.sort(
			function(a, b) {
				return a.time.getTime() - b.time.getTime();
			}.bind(this)
		);
		this.render(date, array);
		array.forEach(function(each) {
			this.items.push(each);
		}.bind(this));
	},
	
	render: function(date, items) {
		
		return false;
		var self = this;
		var main = document.querySelector('.content');
		main.classList.add('day');
		var element = html`<div>
			<div class="heading">
				${dateFns.format(date, 'EEEE')}
			</div>
			<div class="subheading">
				${dateFns.format(date, 'MMMM do, yyyy')}
			</div>
			${items.map(function(each, index) {
				if (each.begin) {
					return html`
						<div>
							<div class="more" style="display:none;">Loading...</div>
							<div class='item item-begin'>
								<a href="" onclick=${self.clicked.bind(self)} onitem=${self.item.bind(each)}>
									${dateFns.format(each.time, 'hh:mmaaaaa')}m
								</a>
								"${each.name}" begins.
							</div>
						</div>
					`;
				} else {
					return html`
						<div>
							<div class='item item-end'>
								"${each.name}" ends. <a href="" onclick=${self.clicked.bind(self)} onitem=${self.item.bind(each)}>
									${dateFns.format(each.time, 'hh:mmaaaaa')}m
								</a>
							</div>
							<div class="more" style="display:none;">Loading...</div>
						</div>
					`;
				}
			})}
		</div>`
		main.appendChild(element);
	},
	
	item: function() {
		return this;
	},
	
	clicked: function(event) {
		
		try {
			var item = event.target.onitem();
			var range = this.find(item);
			console.log('range.begin: ' + dateFns.format(range.begin, 'hh:mmaaaaa'));
			console.log('range.end: ' + dateFns.format(range.end, 'hh:mmaaaaa'));
		} catch (e) {
			console.log(e);
		}
		var element = event.target.parentElement.parentElement.querySelector('.more');
		if (element.style.display == 'none') {
			element.style.display = 'block';
		} else {
			element.style.display = 'none';
		}
		
		return false;
	},
	
	find: function(item) {
		
		var index = this.items.indexOf(item);
		if (item.begin) {
			return {
				begin : this.items[index - 1].time,
				end : item.time
			};
		} else {
			return {
				begin : item.time,
				end : this.items[index + 1].time,
			};
		}
	}
});
