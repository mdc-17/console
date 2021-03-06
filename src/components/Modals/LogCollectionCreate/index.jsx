/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get } from 'lodash'
import classnames from 'classnames'

import { Modal } from 'components/Base'
import widthBack from 'components/Modals/WithBack'

import collectionConfig from './config'

import styles from './index.scss'

export default class CreateLogCollectionModal extends Component {
  static propTypes = {
    store: PropTypes.object,
    detail: PropTypes.object,
    visible: PropTypes.bool,
    isSubmitting: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    visible: false,
    isSubmitting: false,
    onOk() {},
    onCancel() {},
  }

  collectionMap = Object.entries(collectionConfig).reduce(
    (configs, [type, config]) => ({
      ...configs,
      [type]: {
        Form: widthBack(config.Form),
      },
    }),
    {}
  )

  formRef = React.createRef()

  state = {
    collectionType: '',
  }

  selectCollectionType = e => {
    this.setState(
      {
        collectionType: e.currentTarget.dataset.type,
      },
      () => {
        const validator = get(
          collectionConfig,
          `${this.state.collectionType}.validator`
        )
        this.formRef.current.setCustomValidator(validator)
      }
    )
  }

  handleSubmit = data => {
    this.props.onOk({
      ...data,
      ...{ Name: this.state.collectionType },
    })
  }

  returnToSelectTypeForm = () => {
    this.setState({
      collectionType: '',
    })
  }

  hasCollectionType(type) {
    return this.props.store.collections.find(
      collection => collection.Name === type
    )
  }

  render() {
    const { title, ...rest } = this.props
    const { collectionType } = this.state
    return (
      <Modal.Form
        {...rest}
        icon="clock"
        width={691}
        title={title}
        formRef={this.formRef}
        onOk={this.handleSubmit}
        bodyClassName={styles.body}
        disableOk={collectionType === ''}
      >
        {this.renderContent()}
      </Modal.Form>
    )
  }

  renderContent() {
    const { collectionType } = this.state
    const CreateForm = get(this.collectionMap, `${collectionType}.Form`)
    const title = get(collectionConfig, `${collectionType}.title`)

    return CreateForm ? (
      <CreateForm
        wrapperTitle={title}
        wrapperOnBack={this.returnToSelectTypeForm}
      />
    ) : (
      this.renderFormSelector()
    )
  }

  renderFormSelector() {
    return (
      <div>
        <p className={styles.createTip}>{t('LOG_COLLECTION_TIPS')}</p>
        <div className={styles.items}>{this.renderFormSelectorItems()}</div>
      </div>
    )
  }

  renderFormSelectorItems() {
    return Object.entries(collectionConfig).map(
      ([type, { ICON, ...summery }]) => (
        <div
          key={type}
          data-type={type}
          className={classnames(
            styles.collectionType,
            this.hasCollectionType(type) && styles.disabled
          )}
          onClick={
            this.hasCollectionType(type) ? null : this.selectCollectionType
          }
        >
          <div>
            <ICON width={40} height={40} />
          </div>
          <div>
            <h3>{summery.title}</h3>
            <p>{summery.description}</p>
          </div>
        </div>
      )
    )
  }
}
