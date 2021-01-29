'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const when = require('when');
const client = require('./client');

const follow = require('./follow'); 

const root = '/api';

class Be extends React.Component {

	constructor(props) {
		super(props);
		this.state = {tips: [], owns: [], pageSize: 9, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	loadFromServer(pageSize) {
		follow(client, root, [ 
			{rel: 'tips', params: {size: pageSize}}]
		).then(tipCollection => { 
			return client({
				method: 'GET',
				path: tipCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				this.links = tipCollection.entity._links;
				return tipCollection;
			});
		}).then(tipCollection => { 
			return tipCollection.entity._embedded.tips.map(tip =>
					client({
						method: 'GET',
						path: tip._links.self.href
					})
			);
		}).then(tipPromises => { 
			return when.all(tipPromises);
		}).done(tips => {
			this.setState({
				tips: tips,
				owns: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links
			});
		});
	}

	onCreate(newTip) {
		const self = this;
		follow(client, root, ['tips']).then(response => {
			return client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newTip,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [{rel: 'tips', params: {'size': self.state.pageSize}}]);
		}).done(response => {
			if (typeof response.entity._links.last !== "undefined") {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		});
	}
	
	onUpdate(tip, updatedTip) {
		client({
			method: 'PUT',
			path: tip.entity._links.self.href,
			entity: updatedTip,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': tip.headers.Etag
			}
		}).done(response => {
			this.loadFromServer(this.state.pageSize);
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' +
					tip.entity._links.self.href + '.Uncopy.');
			}
		});
	}

	onDelete(tip) {
		client({method: 'DELETE', path: tip.entity._links.self.href}).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}
    
    
	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(tipCollection => {
			this.links = tipCollection.entity._links;

			return tipCollection.entity._embedded.tips.map(tip =>
					client({
						method: 'GET',
						path: tip._links.self.href
					})
			);
		}).then(tipPromises => {
			return when.all(tipPromises);
		}).done(tips => {
			this.setState({
				tips: tips,
				owns: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}


	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

    componentDidMount() {
		this.loadFromServer(this.state.pageSize);
	}

	render() {
		return (
			<div>
				<CreateDialog owns={this.state.owns} onCreate={this.onCreate}/>
				<TipList tips={this.state.tips}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  owns={this.state.owns}
							  onNavigate={this.onNavigate}
							  onUpdate={this.onUpdate}
							  onDelete={this.onDelete}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newTip = {};
		this.props.owns.forEach(own => {
			newTip[own] = ReactDOM.findDOMNode(this.refs[own]).value.trim();
		});
		this.props.onCreate(newTip);
		this.props.owns.forEach(own => {
			ReactDOM.findDOMNode(this.refs[own]).value = ''; 
		});
		window.location = "#";
	}

	render() {
		const inputs = this.props.owns.map(own =>
			<p key={own}>
				<input type="text" placeholder={own} ref={own} className="field"/>
			</p>
		);
		return (
			<div>
				<a href="#createTip">Create</a>

				<div id="createTip" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>New</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}


class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const updatedTip = {};
		this.props.owns.forEach(own => {
			updatedTip[own] = ReactDOM.findDOMNode(this.refs[own]).value.trim();
		});
		this.props.onUpdate(this.props.tip, updatedTip);
		window.location = "#";
	}

	render() {
		const inputs = this.props.owns.map(own =>
			<p key={this.props.tip.entity[own]}>
				<input type="text" placeholder={own}
					   defaultValue={this.props.tip.entity[own]}
					   ref={own} className="field"/>
			</p>
		);

		const dialogId = "updateHolding(s)-" + this.props.tip.entity._links.self.href;

		return (
			<div key={this.props.tip.entity._links.self.href}>
				<a href={"#" + dialogId}>Do Update</a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update session</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

};


class TipList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
		}
	}


    handleNavFirst(e){
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}
	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}
	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}
	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

    render() {
		const tips = this.props.tips.map(tip =>
			<Tip key={tip.entity._links.self.href}
					  tip={tip}
					  owns={this.props.owns}
					  onUpdate={this.props.onUpdate}
					  onDelete={this.props.onDelete}/>
		);

		const navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
		}

		return (
			<div>
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				<table>
					<tbody>
						<tr>
							<th>Serv:ce</th>
							<th>Amount</th>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Address</th>
							<th>Cell Phone</th>
							
						</tr>
						{tips}
					</tbody>
				</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}

class Tip extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.tip);
	}

	render() {
		return (
			<tr>
				<td> {this.props.tip.entity.serv}</td>
				<td> ₦ {this.props.tip.entity.servNumber}</td>
				<td> {this.props.tip.entity.firstName}</td>
				<td> {this.props.tip.entity.lastName}</td>
				<td> {this.props.tip.entity.address}</td>
				<td> {this.props.tip.entity.f1}</td>
				<td>
					<UpdateDialog tip={this.props.tip}
								  owns={this.props.owns}
								  onUpdate={this.props.onUpdate}/>
				</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}

ReactDOM.render(
	<Be />,
	document.getElementById('reach')
)
