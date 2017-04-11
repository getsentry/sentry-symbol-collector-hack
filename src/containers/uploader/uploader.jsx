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
      <div>
        <Dropzone
            className={styles.dropzone}
            activeClassName={styles.active}
            onDrop={this.onDrop.bind(this)}
            multiple={false}>
            <div className={styles.droper} />
            <h3>Drop your crashreport here</h3>
        </Dropzone>
      </div>
    );
  }

}

function mapStateToProperties(state) {
  return {
  };
}

export default connect(mapStateToProperties)(Uploader);
