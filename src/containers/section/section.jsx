import React, { Component } from 'react';
import styles from './section.scss';
import classnames from 'classnames';

type Props = {
  hazy: boolean
}

export default class Section extends Component {
  props: Props;

  render() {
    const classNames = classnames(
        this.props.hazy ? styles.hazy : styles.section, this.props.className
    );
    return (
      <div className={classNames}>
        {this.props.children}
      </div>
    );
  }

}
