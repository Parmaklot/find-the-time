import { useState } from 'react';
import { validate } from 'validate.js';
import Button from 'ui-kit/Button';
import Form from 'ui-kit/Form';
import InfoTile from 'components/InfoTile';
import Input from 'ui-kit/Input';
import Modal from 'ui-kit/Modal';
import Page from 'ui-kit/Page';
import Text from 'components/Text';
import { changeUserName } from 'api/users';
import { notifyOnNetworkError } from 'store/slices/notifications';
import { updateFromNewToken } from 'store/slices/account';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { constraints, NameChangeValidation } from './constraints';
import styles from './Account.module.scss';

const Account: React.VFC = () => {
  const dispatch = useAppDispatch();

  const { email, name, isDemo } = useAppSelector((store) => store.account);

  const nameIsSpecified = name !== '';
  const nameChangeVerb = nameIsSpecified ? 'Change' : 'Set';

  const [nameChangeModalIsOpen, setNameChangeModalIsOpen] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [nameInputIsTouched, setNameInputIsTouched] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const errors: NameChangeValidation = validate(
    { name: nameInput },
    constraints
  );

  const handleModalOkClick = async () => {
    setNameInputIsTouched(true);

    if (errors) {
      return;
    }

    setNameChangeModalIsOpen(false);

    setIsLoading(true);
    try {
      const { data: updatedToken } = await changeUserName({ name: nameInput });

      dispatch(updateFromNewToken(updatedToken));
    } catch (error) {
      dispatch(
        notifyOnNetworkError(`${nameChangeVerb.toLowerCase()} your name`, error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page title="Your Account" isLoading={isLoading}>
      {nameChangeModalIsOpen && (
        <Modal
          title={`${nameChangeVerb} Name`}
          onOkClick={handleModalOkClick}
          onCancelClick={() => setNameChangeModalIsOpen(false)}
        >
          <Form defaultPreventedOnSubmission layout="responsive">
            <Form.Column>
              <Form.Item
                id="name"
                label="New Name"
                errorMessage={nameInputIsTouched ? errors?.name : undefined}
              >
                <Input
                  value={nameInput}
                  onChange={({ target }) => setNameInput(target.value)}
                  onBlur={({ target }) => {
                    target.value !== '' && setNameInputIsTouched(true);
                  }}
                />
              </Form.Item>
            </Form.Column>
          </Form>
        </Modal>
      )}
      <div className={styles['Root']}>
        <InfoTile heading="Email" icon="Email">
          <Text>{email}</Text>
        </InfoTile>
        <InfoTile heading="Name" icon="Person">
          <div className={styles['Name']}>
            {nameIsSpecified ? (
              <Text clamp={1}>{name}</Text>
            ) : (
              <Text font="primaryItalic">
                You haven’t told us your name yet.
              </Text>
            )}
            <Button
              elementProps={{ onClick: () => setNameChangeModalIsOpen(true) }}
            >
              {nameChangeVerb}
            </Button>
          </div>
        </InfoTile>
        {isDemo && (
          <InfoTile heading="Demo" icon="Info">
            <Text>This is a demo account</Text>
          </InfoTile>
        )}
      </div>
    </Page>
  );
};

export default Account;
