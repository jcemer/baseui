/*
Copyright (c) 2018 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
// @flow
import React from 'react';
import {STATE_CHANGE_TYPE} from './constants.js';
import type {
  StatefulContainerPropsT,
  StateReducerT,
  StateT,
  ParamsT,
  ChangeActionT,
} from './types.js';

const defaultStateReducer: StateReducerT = (type, nextState) => nextState;

class StatefulSliderContainer extends React.Component<
  StatefulContainerPropsT,
  StateT,
> {
  constructor(props: StatefulContainerPropsT) {
    super(props);
    this.state = {
      value:
        props.initialState && Array.isArray(props.initialState.value)
          ? props.initialState.value
          : [Math.round((props.max - props.min) / 2) + props.min],
    };
  }
  static defaultProps = {
    stateReducer: defaultStateReducer,
    min: 0,
    max: 100,
    step: 1,
    onChange: () => {},
  };

  onChange = (params: {value: Array<number>}) => {
    this.internalSetState(STATE_CHANGE_TYPE.change, params);
    return this.props.onChange({...params});
  };

  internalSetState = (type: ChangeActionT, {value}: ParamsT) => {
    const nextState = {value};
    const {stateReducer} = this.props;
    const newState = stateReducer(type, nextState, this.state);
    this.setState(newState);
  };

  render() {
    const {
      children,
      initialState, // eslint-disable-line no-unused-vars
      stateReducer, // eslint-disable-line no-unused-vars
      ...rest
    } = this.props;
    return children({
      ...rest,
      ...this.state,
      onChange: this.onChange,
    });
  }
}

export default StatefulSliderContainer;
