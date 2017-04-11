import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeCrashReport, uploadCrashReport } from 'actions/editor';
import styles from './editor.scss';
import Dropzone from 'react-dropzone';

type Props = {
  dispatch: () => void,
  code: string
}

export class Editor extends Component {
  props: Props;

  changeCrashReport(event) {
    this.props.dispatch(changeCrashReport(event.target.value));
  }

  onDrop(files) {
    this.props.dispatch(uploadCrashReport(files));
  }

  render() {
    const options = {
      lineNumbers: true,
    };

    return (
      <div className={styles.textContainer}>
        <Dropzone onDrop={this.onDrop.bind(this)} multiple={false} />
        <textarea value={this.props.code} onChange={this.changeCrashReport.bind(this)} />
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
