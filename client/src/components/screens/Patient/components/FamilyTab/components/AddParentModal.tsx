import { Form, Input, Radio } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';

const AddParentModal: React.FC = () => (
  <Modal
    visible
    title="Ajouter la mère"
    className="family-tab__details__add-parent__modal"
    okText="Ajouter"
    cancelText="Annuler"
    okButtonProps={{ disabled: true }}
  >
    <Form className="family-tab__details__add-parent__modal__form">
      <Form.Item
        labelCol={{ span: 24 }}
        label="Chercher un(e) patient(e) par nom de famille ou RAMQ"
        className="family-tab__details__add-parent__modal__form__search"
      >
        <Input placeholder="Ex: Tremblay, LEML 1924537..." />
      </Form.Item>
      <div className="family-tab__details__add-parent__modal__patient-card">
        <div className="family-tab__details__add-parent__modal__patient-card__info">
          <span className="family-tab__details__add-parent__modal__patient-card__info__name">Morty Smith</span>
        </div>
        <dl>
          <dt>RAMQ</dt>
          <dd>SMIM12341234</dd>
          <dt>Date de naissance</dt>
          <dd>2001-01-01</dd>
          <dt>Dossier(s)</dt>
          <dd>123456 À CHUSJ</dd>
        </dl>
      </div>
      <Form.Item
        labelCol={{ span: 24 }}
        label="Veullez préciser le statut"
        className="family-tab__details__add-parent__modal__form__status"
      >
        <Radio.Group>
          <Radio value="non">Non-atteint(e)</Radio>
          <Radio value="oui">Atteint(e)</Radio>
          <Radio value="unknown">Inconnu</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>

  </Modal>
);

export default AddParentModal;
