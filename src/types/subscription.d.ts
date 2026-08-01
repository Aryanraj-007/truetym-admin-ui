export interface Subscription {
  id: string;
  razorpay_plan_id: string;
  plan_type: number;
  title: string;
  currency: string;
  description?: string;
  amount: number;
  created_at: string;
  typeId: string;
  totalFeatures: number;
  totalCustomers: number;
  customerDetails: Array<{
    id: string;
    name: string;
  }>;
}

export interface SubscriptionsResponse {
  message: string[];
  succeeded: boolean;
  data: Subscription[];
}

export interface CreateCustomPlanRequest {
  planName: string;
  planDescription?: string;
  billingAmount: number;
  billingFrequency: number;
  billingPeriod: 'monthly' | 'yearly';
}

export interface CreateCustomPlanResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    planName: string;
    planDescription?: string;
    billingAmount: number;
    billingFrequency: number;
    createdAt: number;
  };
}

export interface PlanDetailsResponse {
  message: string[];
  succeeded: boolean;
  data: {
    id: string;
    razorpay_plan_id: string;
    title: string;
    description: string | null;
    plan_type: number;
    featureList: Array<{
      id: string;
      title: string;
      subFeatures: Array<{
        id: string;
        title: string;
        featureRoutes: {
          id: string | null;
          pages: string[] | null;
          title: string;
          routes: string[] | null;
        };
      }>;
    }>;
  };
}
