import React, { Component } from 'react';
import { connect } from 'react-redux';
import { uploadCrashReport } from 'actions/editor';
import styles from './uploader.scss';
import Dropzone from 'react-dropzone';

type Props = {
  dispatch: () => void
}

export class Uploader extends Component {

  props: Props;

  onDrop(files) {
    this.props.dispatch(uploadCrashReport(files));
  }

  render() {
    return (
      <Dropzone
          className={styles.dropzone}
          onDrop={this.onDrop.bind(this)}
          multiple={false}
          disableClick={true}>
          {this.props.children}
      </Dropzone>
    );
  }

}

function mapStateToProperties(state) {
  return {
  };
}

export default connect(mapStateToProperties)(Uploader);
