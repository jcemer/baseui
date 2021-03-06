/*
Copyright (c) 2018 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
// @flow
/* global fetch process */

import * as React from 'react';
import CodeSandboxer from 'react-codesandboxer';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {Button, KIND} from 'baseui/button';
import {Card} from 'baseui/card';
import {Block} from 'baseui/block';
import Check from 'baseui/icon/check';
import {StyledLink} from 'baseui/link';
import {styled} from 'baseui/styles';

import {version} from '../../package.json';
import Code from './code';
import {trackEvent} from '../helpers/ga';

const Link = styled(StyledLink, {cursor: 'pointer'});

const index = `
import React from "react";
import ReactDOM from "react-dom";

import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

import Example from "./example";

const engine = new Styletron();

function App() {
  return <Example />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StyletronProvider value={engine}>
    <App />
  </StyletronProvider>,
  rootElement
);
`;

function Source(props: {children: ?React.Node}) {
  if (!props.children || typeof props.children !== 'string') return null;
  return <Code>{props.children}</Code>;
}

type PropsT = {
  additionalPackages: {[string]: string},
  children: React.Node,
  path: string, // required to fetch the uncompiled source code
  title: string,
};

type StateT = {
  isCopied: boolean,
  isSourceOpen: boolean,
  source: ?string,
};

class Example extends React.Component<PropsT, StateT> {
  static defaultProps = {additionalPackages: {}};
  state = {
    isCopied: false,
    isSourceOpen: false,
    source: null,
  };

  async componentDidMount() {
    const sourcePath = `${String(process.env.STATIC_ROOT)}${this.props.path}`;
    const res = await fetch(sourcePath);
    const source = await res.text();
    this.setState({source});
  }

  handleCopy = () => {
    this.setState({isCopied: true}, () =>
      setTimeout(() => this.setState({isCopied: false}), 5000),
    );
  };

  render() {
    return (
      <Card
        overrides={{
          Root: {
            style: ({$theme}) => ({
              maxWidth: '776px',
              marginBottom: $theme.sizing.scale1200,
            }),
          },
          Contents: {style: {margin: 0}},
        }}
      >
        <Block
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingTop="scale600"
          paddingRight="scale500"
          paddingBottom="scale600"
          paddingLeft="scale800"
        >
          <Block
            overrides={{
              Block: {
                style: {
                  textTransform: 'lowercase',
                  ':first-letter': {
                    textTransform: 'uppercase',
                  },
                },
              },
            }}
            as="span"
            font="font500"
            color="mono1000"
          >
            {this.props.title}
          </Block>
          <Block display="flex" alignItems="center">
            <Button
              kind={KIND.secondary}
              onClick={() => {
                this.setState(prevState => ({
                  isSourceOpen: !prevState.isSourceOpen,
                }));
                trackEvent('show_source', this.props.title);
              }}
            >
              {this.state.isSourceOpen ? 'Hide' : 'Show'} Source
            </Button>
          </Block>
        </Block>

        <Block
          padding="scale600"
          overrides={{
            Block: {
              style: ({$theme}) => ({
                borderTop: `1px solid ${$theme.colors.border}`,
                borderBottom: this.state.isSourceOpen
                  ? `1px solid ${$theme.colors.border}`
                  : null,
              }),
            },
          }}
        >
          {this.props.children}
        </Block>

        {this.state.isSourceOpen && (
          <Block margin="scale800">
            <Block overflow="scrollX">
              <Source>{this.state.source}</Source>
            </Block>
            <Block
              display="flex"
              justifyContent="flex-end"
              marginTop="scale400"
            >
              <Block marginRight="scale600">
                <CopyToClipboard
                  onCopy={() => {
                    this.handleCopy();
                    trackEvent('copy_to_clipboard', this.props.title);
                  }}
                  text={this.state.source}
                >
                  {this.state.isCopied ? (
                    <Button
                      kind={KIND.tertiary}
                      endEnhancer={() => <Check size="scale800" />}
                    >
                      Copied to clipboard
                    </Button>
                  ) : (
                    <Button kind={KIND.tertiary}>Copy to clipboard</Button>
                  )}
                </CopyToClipboard>
              </Block>
              <CodeSandboxer
                examplePath="/"
                example={this.state.source}
                name={this.props.title}
                afterDeploy={() => {
                  trackEvent('codesandbox_deployed', this.props.title);
                }}
                afterDeployError={() => {
                  trackEvent('codesandbox_deployed_error', this.props.title);
                }}
                dependencies={{
                  baseui: version,
                  react: '16.5.2',
                  'react-dom': '16.5.2',
                  'react-scripts': '2.0.3',
                  'styletron-engine-atomic': '1.0.9',
                  'styletron-react': '4.4.4',
                  ...this.props.additionalPackages,
                }}
                providedFiles={{'index.js': {content: index}}}
                template="create-react-app"
              >
                {() => (
                  <Link>
                    <Button kind={KIND.tertiary}>Edit on CodeSandbox</Button>
                  </Link>
                )}
              </CodeSandboxer>
            </Block>
          </Block>
        )}
      </Card>
    );
  }
}

export default Example;
