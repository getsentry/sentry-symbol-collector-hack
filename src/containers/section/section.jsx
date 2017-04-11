import React, { Component } from 'react';
import styles from './section.scss';

type Props = {
  hazy: boolean,
}

export default class Section extends Component {
  props: Props;

  render() {
    return (
      <div className={this.props.hazy ? styles.hazy : styles.section}>
        {this.props.children}
      </div>
    );
  }

}
