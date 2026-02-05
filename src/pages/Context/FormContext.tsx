import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormStates {
  profile: boolean;
  estimate: boolean;
  invoice: boolean;
  customer: boolean;
  inventory: boolean;
  payment: boolean;
}

interface FormContextType {
  formStates: FormStates;
  isFormEnabled: (formName: keyof FormStates) => boolean;
  setFormEnabled: (formName: keyof FormStates, enabled: boolean) => void;
  setAllFormsEnabled: (enabled: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formStates, setFormStates] = useState<FormStates>({
    profile: false,
    estimate: false,
    invoice: false,
    customer: false,
    inventory: false,
    payment: false
  });

  const isFormEnabled = (formName: keyof FormStates): boolean => {
    return formStates[formName];
  };

  const setFormEnabled = (formName: keyof FormStates, enabled: boolean): void => {
    setFormStates((prev) => ({
      ...prev,
      [formName]: enabled,
    }));
  };

  const setAllFormsEnabled = (enabled: boolean): void => {
    setFormStates({
      profile: enabled,
      estimate: enabled,
      invoice: enabled,
      customer: enabled,
      inventory: enabled,
      payment: enabled
    });
  };

  return (
    <FormContext.Provider
      value={{
        formStates,
        isFormEnabled,
        setFormEnabled,
        setAllFormsEnabled,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};