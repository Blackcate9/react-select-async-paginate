import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Select from 'react-select';

const initialCache = {
  options: [],
  hasMore: false,
  isLoading: false,
};

class AsyncPaginate extends Component {
  static propTypes = {
    loadOptions: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    cacheUniq: PropTypes.any,
    selectRef: PropTypes.func,
  };

  static defaultProps = {
    cacheUniq: null,
    selectRef: () => {},
  };

  state = {
    search: '',
    optionsCache: {},
  }

  componentDidUpdate({ cacheUniq }) {
    if (cacheUniq !== this.props.cacheUniq) {
      this.setState({
        optionsCache: {},
      });
    }
  }

  onClose = () => {
    this.setState({
      search: '',
    });
  }

  onOpen = () => {
    if (!this.state.optionsCache['']) {
      this.loadOptions();
    }
  }

  onInputChange = async (search) => {
    await this.setState({
      search,
    });

    if (!this.state.optionsCache[search]) {
      await this.loadOptions();
    }
  }

  onMenuScrollToBottom = async () => {
    const {
      search,
      optionsCache,
    } = this.state;

    const currentOptions = optionsCache[search];

    if (currentOptions && currentOptions.hasMore) {
      await this.loadOptions();
    }
  }

  async loadOptions() {
    const {
      search,
      optionsCache,
    } = this.state;

    const currentOptions = optionsCache[search] || initialCache;

    if (currentOptions.isLoading) {
      return;
    }

    await this.setState({
      search,
      optionsCache: {
        ...this.state.optionsCache,
        [search]: {
          ...currentOptions,
          isLoading: true,
        },
      },
    });

    try {
      const {
        options,
        hasMore,
      } = await this.props.loadOptions(search, currentOptions.options);

      await this.setState({
        optionsCache: {
          ...this.state.optionsCache,
          [search]: {
            ...currentOptions,
            options: currentOptions.options.concat(options),
            hasMore: !!hasMore,
            isLoading: false,
          },
        },
      });
    } catch (e) {
      await this.setState({
        optionsCache: {
          ...this.state.optionsCache,
          [search]: {
            ...currentOptions,
            isLoading: false,
          },
        },
      });
    }
  }

  render() {
    const {
      selectRef,
    } = this.props;

    const {
      search,
      optionsCache,
    } = this.state;

    const currentOptions = optionsCache[search] || initialCache;

    return (
      <Select
        {...this.props}
        onClose={this.onClose}
        onOpen={this.onOpen}
        onInputChange={this.onInputChange}
        onMenuScrollToBottom={this.onMenuScrollToBottom}
        isLoading={currentOptions.isLoading}
        options={currentOptions.options}
        ref={selectRef}
      />
    );
  }
}

export default AsyncPaginate;
