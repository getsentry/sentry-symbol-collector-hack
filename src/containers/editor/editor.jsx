import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeCrashReport, uploadCrashReport } from 'actions/editor';
import styles from './editor.scss';
import Dropzone from 'react-dropzone';

type Props = {
  dispatch: () => void,
  crashReport: string,
  crashReportSymbolicated: string,
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
    return (
      <div className={styles.editor}>
        <Dropzone onDrop={this.onDrop.bind(this)} multiple={false} />
        <div className={styles.textContainer}>
          <textarea value={this.props.crashReport} onChange={this.changeCrashReport.bind(this)} />
          <textarea value={this.props.crashReportSymbolicated} readOnly={true} />
        </div>
      </div>
    );
  }
}

function mapStateToProperties(state) {
  return {
    crashReport: state.editor.crashReport,
    crashReportSymbolicated: state.editor.crashReportSymbolicated,
  };
}

export default connect(mapStateToProperties)(Editor);
