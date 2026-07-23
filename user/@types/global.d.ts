type ButtonProps = {
  title?: string;
  onPress?: () => void;
  width?: DimensionValue;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
};

type UserType = {
  id: string;
  name: string;
  email?: string;
  phone_number: string;
  ratings?: number;
  totalRides?: number;
  createdAt: Date;
  updatedAt: Date;
};
