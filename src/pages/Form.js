import React from 'react';

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ username: event.target.value });
  }

  render() {
    return (
      <form>
        Username:
        <input type="text" value={this.state.username} onChange={this.handleChange} />
      </form>
    );
  }
}

export default Form;
