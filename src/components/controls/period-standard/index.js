import './styles.css';
import Select from 'react-select';
import { useEffect, useState } from 'react';

const PeriodToday = {
   label: 'Today',
   value: 'T'
};

const PeriodOptions = [
   PeriodToday,
   {
      label: 'Yesterday',
      value: 'Y'
   },
   {
      label: 'This week',
      value: 'W'
   },
   {
      label: '7 days',
      value: '7'
   },
   {
      label: 'This month',
      value: 'M'
   },
   {
      label: '30 days',
      value: '30'
   },
   {
      label: '3 months',
      value: '3M'
   },
   {
      label: '6 months',
      value: '6M'
   },
   {
      label: 'This year',
      value: 'YR'
   },
   {
      label: '1 year',
      value: '1Y'
   },
   {
      label: 'Max',
      value: 'MAX'
   }
];

export function getDateFromPeriod(period) {

   const fnCurrDate = () => {
      let dt = new Date();
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
   }

   const fnAddDays = (days, baseDate) => {
      let dt = baseDate ?? fnCurrDate();
      dt.setDate(dt.getDate() + days);
      return dt;
   }

   const fnGetBeginWeek = () => {
      let dt = fnCurrDate();
      if (dt.getDay() !== 1) {
         dt.setDate(dt.getDate() - (dt.getDay() -1));
      }
      return dt;
   }

   const fnGetBeginMonth = () => {
      let dt = fnCurrDate();
      if (dt.getDate() !== 1) {
         dt.setDate(dt.getDate() - (dt.getDate() -1));
      }
      return dt;
   }

   const fnGetBeginYear = () => {
      let dt = fnCurrDate();
      return new Date(dt.getFullYear(), 1, 1);      
   }

   switch (period) {
      case 'T': return {from: fnCurrDate(), to: fnCurrDate()};
      case 'Y': return {from: fnAddDays(-1), to: fnAddDays(-1)};
      case 'W': return {from: fnGetBeginWeek(), to: fnAddDays(6, fnGetBeginWeek())};
      case '7': return {from: fnAddDays(-6), to: fnCurrDate()};
      case 'M': return {from: fnGetBeginMonth(), to: fnCurrDate()};
      case '30': return {from: fnAddDays(-29), to: fnCurrDate()};
      case '3M': return {from: fnAddDays(-89), to: fnCurrDate()};
      case '6M': return {from: fnAddDays(-180), to: fnCurrDate()};
      case 'YR': return {from: fnGetBeginYear(), to: fnCurrDate()};
      case '1Y': return {from: fnAddDays(-364), to: fnCurrDate()};
      case 'MAX': return {from: new Date(1970, 1, 1), to: fnCurrDate()};
      default: return {from: fnCurrDate(), to: fnCurrDate()};
   }
}


export default function PeriodStandard(props) {

   const [selOption, setSelOption] = useState(PeriodToday);

   if (!props.value) {
      throw new Error('value is not informed!');
   }

   if (!props.onChange) {
      throw new Error('onChange is not informed!');
   }

   useEffect(() => {
      if (props.value) {
         const itmVal = PeriodOptions.find((itm) => itm.value === props.value);
         if (itmVal) {
            setSelOption(itmVal);
         }
      }
   }, [props.value]);


   const handleSel = (itm) => {
      if (itm) {
         props.onChange(itm.value);
      }      
   }

   return (
      <div className='period-standard'>
         <Select 
            value={selOption}
            onChange={handleSel}            
            classNamePrefix='p-std-select'
            options={PeriodOptions}
         />
      </div>
   );
}
