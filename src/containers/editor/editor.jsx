import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateCode } from 'actions/editor';
import styles from './editor.scss';
import CodeMirror from 'react-codemirror';

type Props = {
  dispatch: () => void,
  code: string
}

export class Editor extends Component {
  props: Props;

  updateCode(code) {
    this.props.dispatch(updateCode(code));
  }

  render() {
    const options = {
      lineNumbers: true,
    };

    return (
      <div className={styles.textContainer}>
        <CodeMirror
          value={this.props.code} onChange={this.updateCode.bind(this)} options={options}
        />
      </div>
    );
  }
}

function mapStateToProperties(state) {
  return {
    code: state.editor.code
  };
}

export default connect(mapStateToProperties)(Editor);
