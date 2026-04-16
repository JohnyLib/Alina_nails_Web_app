/* eslint-disable padding-line-between-statements */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Camera, Loader2, ChevronLeft, ArrowRight } from 'lucide-react';

const services = [
  { id: 1, name: 'Комбинированный маникюр' },
  { id: 2, name: 'Наращивание ногтей' },
  { id: 3, name: 'Коррекция + покрытие' },
];

const nailLengths = [
  { id: 1, name: 'Короткие', price: 50 },
  { id: 2, name: 'Средние', price: 100 },
  { id: 3, name: 'Длинные', price: 150 }
];

const times = ['10:00', '12:00', '14:00', '16:00', '18:00'];

const generateDates = () => {
  const datesArray = [];
  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    datesArray.push({
      id: i,
      day: weekdays[d.getDay()],
      date: d.getDate().toString(),
      month: months[d.getMonth()],
      fullString: `${d.getDate()} ${months[d.getMonth()]}`
    });
  }
  return datesArray;
};

// Палитра:
// bg main: #FAF7F2
// bg card: #FFFFFF
// text main: #3E3A37
// text sub: #8B857F
// accent bg: #D5BDB0
// border: #EDE9E3

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [availableDates] = useState(generateDates());

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLength, setSelectedLength] = useState(nailLengths[1]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoExample, setPhotoExample] = useState(null);
  const fileInputRef = useRef(null);

  // Инициализация
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user?.first_name) {
        setFullName(tg.initDataUnsafe.user.first_name + (tg.initDataUnsafe.user.last_name ? ' ' + tg.initDataUnsafe.user.last_name : ''));
      }
    }
  }, []);

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoExample(URL.createObjectURL(e.target.files[0]));
    }
  };

  const totalPrice = (selectedService ? 200 : 0) + (selectedLength ? selectedLength.price : 0);

  const canGoNext = () => {
    if (currentStep === 1) return selectedService !== null;
    if (currentStep === 2) return selectedLength !== null;
    if (currentStep === 3) return true; // Фото по желанию
    if (currentStep === 4) return selectedDate !== null && selectedTime !== '';
    if (currentStep === 5) return fullName.trim() !== '' && phone.trim() !== '';
    return true;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleBooking();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBooking = () => {
    const serviceName = services.find(s => s.id === selectedService)?.name;
    const bookingData = {
      user: fullName,
      phone,
      service: serviceName,
      length: selectedLength?.name,
      hasPhoto: !!photoExample,
      date: selectedDate?.fullString,
      time: selectedTime,
      total: totalPrice
    };

    const tg = window.Telegram?.WebApp;
    if (tg?.sendData) {
      tg.sendData(JSON.stringify(bookingData));
      tg.close();
    } else {
      console.log('Данные для бота:', bookingData);
      alert(`✅ Заявка оформлена!\n\nИмя: ${bookingData.user}\nУслуга: ${serviceName}\nДлина: ${bookingData.length}\nДата: ${bookingData.date} в ${bookingData.time}\nСумма: ${bookingData.total} MDL`);
    }
  };

  // Анимация экранов квиза
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-[#D5BDB0]/40 rounded-full blur-xl animate-pulse"></div>
             <div className="w-20 h-20 bg-[#D5BDB0] rounded-full flex items-center justify-center relative shadow-lg">
                <Loader2 className="animate-spin text-white" size={36} strokeWidth={2.5} />
             </div>
          </div>
          <h2 className="text-2xl font-bold tracking-[0.2em] text-[#3E3A37] uppercase">
            Alina Nails
          </h2>
        </motion.div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="pb-8">
            <h2 className="text-2xl font-semibold text-[#3E3A37] mb-2 tracking-tight">Какая услуга?</h2>
            <p className="text-[#8B857F] text-[15px] mb-8">Любая основа — <strong className="text-[#3E3A37] font-bold">200 MDL</strong></p>
            
            <div className="flex flex-col gap-3">
              {services.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`flex items-center justify-between p-5 rounded-[20px] cursor-pointer transition-all duration-300 border bg-white ${
                      isSelected 
                        ? 'border-[#D5BDB0] shadow-[0_4px_20px_rgba(213,189,176,0.3)] scale-[1.02]' 
                        : 'border-[#EDE9E3] hover:border-[#D5BDB0]/60 hover:bg-[#FDFBF9]'
                    }`}
                  >
                    <h3 className={`font-medium transition-colors text-[16px] ${isSelected ? 'text-[#3E3A37]' : 'text-[#645F5B]'}`}>
                      {service.name}
                    </h3>
                    <div className={`w-[24px] h-[24px] shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#D5BDB0] bg-white text-[#D5BDB0]' : 'border-[#D2CCC6] bg-transparent'
                    }`}>
                      {isSelected && <div className="w-[12px] h-[12px] rounded-full bg-[#D5BDB0]"/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="pb-8">
            <h2 className="text-2xl font-semibold text-[#3E3A37] mb-2 tracking-tight">Выберите длину</h2>
            <p className="text-[#8B857F] text-[15px] mb-8">Стоимость зависит от длины ногтей</p>

            <div className="flex flex-col gap-3">
              {nailLengths.map((len) => {
                const isSelected = selectedLength?.id === len.id;
                return (
                  <button 
                    key={len.id}
                    onClick={() => setSelectedLength(len)}
                    className={`w-full text-left p-5 rounded-[20px] border transition-all duration-300 bg-white ${
                      isSelected 
                      ? 'border-[#D5BDB0] shadow-[0_4px_20px_rgba(213,189,176,0.3)] scale-[1.02]' 
                      : 'border-[#EDE9E3] hover:border-[#D5BDB0]/60 hover:bg-[#FDFBF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <span className={`text-[16px] font-semibold ${isSelected ? 'text-[#3E3A37]' : 'text-[#645F5B]'}`}>
                           {len.name} ногти
                         </span>
                         <span className={`text-[14px] font-medium mt-0.5 ${isSelected ? 'text-[#B39385]' : 'text-[#8B857F]'}`}>
                           +{len.price} MDL
                         </span>
                       </div>
                       <div className={`w-[24px] h-[24px] shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-[#D5BDB0]' : 'border-[#D2CCC6]'
                       }`}>
                          {isSelected && <div className="w-[12px] h-[12px] rounded-full bg-[#D5BDB0]"/>}
                       </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="pb-8">
            <h2 className="text-2xl font-semibold text-[#3E3A37] mb-2 tracking-tight">Дизайн</h2>
            <p className="text-[#8B857F] text-[15px] mb-8">Загрузите пример желаемого цвета или дизайна (по желанию)</p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-56 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                photoExample ? 'border-[#D5BDB0] shadow-[0_4px_20px_rgba(213,189,176,0.2)]' : 'border-[#D2CCC6] hover:border-[#D5BDB0]/80'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
              {photoExample ? (
                <>
                  <img src={photoExample} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center backdrop-blur-[3px]">
                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,189,176,0.5)] mb-3">
                        <Check size={28} className="text-[#D5BDB0]" />
                     </div>
                     <span className="text-[15px] font-semibold text-[#3E3A37] px-4 py-1 bg-white/80 rounded-lg">Фото загружено</span>
                     <span className="text-[13px] text-[#3E3A37] font-medium mt-2 bg-white/80 px-3 py-1 rounded-full">Нажмите, чтобы изменить</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#FAF7F2] rounded-full flex items-center justify-center mb-4 text-[#B39385] border border-[#EDE9E3]">
                     <Camera size={26} />
                  </div>
                  <span className="text-[16px] font-semibold text-[#3E3A37]">Загрузить пример</span>
                  <span className="text-[13px] text-[#8B857F] mt-1">Из галереи телефона</span>
                </>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="pb-8">
             <h2 className="text-2xl font-semibold text-[#3E3A37] mb-2 tracking-tight">Дата звонка или визита</h2>
             <p className="text-[#8B857F] text-[15px] mb-8">Мастер свяжется или примет вас в это время</p>
             
             <div className="mb-10">
              <label className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#B39385] block mb-4">Ближайшие дни</label>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
                {availableDates.map((item) => {
                  const isSelected = selectedDate?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDate(item)}
                      className={`flex flex-col items-center justify-center min-w-[76px] h-[96px] rounded-[20px] cursor-pointer transition-all duration-300 shrink-0 border bg-white ${
                        isSelected 
                          ? 'border-[#D5BDB0] bg-[#FAF3F0] shadow-[0_4px_15px_rgba(213,189,176,0.3)] scale-[1.05]' 
                          : 'border-[#EDE9E3] hover:border-[#D5BDB0]/50'
                      }`}
                    >
                      <span className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? 'text-[#8C6D62]' : 'text-[#8B857F]'}`}>
                        {item.day}
                      </span>
                      <span className={`text-[26px] font-bold leading-tight ${isSelected ? 'text-[#3E3A37]' : 'text-[#645F5B]'}`}>
                        {item.date}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#8C6D62]' : 'text-[#8B857F]'}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
             </div>

             <div>
               <label className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#B39385] block mb-4">Свободное время</label>
               <div className="grid grid-cols-2 gap-3 pb-2">
                {times.map((t) => {
                  const isSelected = selectedTime === t;
                  return (
                     <div 
                       key={t} 
                       onClick={() => setSelectedTime(t)}
                       className={`flex items-center justify-center px-6 py-[18px] rounded-[18px] cursor-pointer transition-all duration-300 border bg-white ${
                         isSelected
                          ? 'border-[#D5BDB0] text-[#3E3A37] font-bold shadow-[0_4px_15px_rgba(213,189,176,0.3)] bg-[#FDFBF9] scale-[1.02]'
                          : 'border-[#EDE9E3] font-medium text-[#645F5B] hover:border-[#D5BDB0]/50 hover:bg-[#FDFBF9]'
                       }`}
                     >
                       <span className="text-[17px] tracking-wide">{t}</span>
                     </div>
                  )
                })}
               </div>
             </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="step5" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="pb-8">
            <h2 className="text-2xl font-semibold text-[#3E3A37] mb-2 tracking-tight">Личные данные</h2>
            <p className="text-[#8B857F] text-[15px] mb-8">Оставьте контакты для связи</p>
            
            <div className="space-y-4 pb-4">
              <div>
                <label className="text-[13px] font-bold uppercase tracking-wider text-[#B39385] block mb-2 px-1">Ваше Имя и Фамилия</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Анна Смирнова"
                  className="w-full bg-white border border-[#EDE9E3] rounded-2xl px-5 py-[18px] text-[#3E3A37] placeholder:text-[#C7C2BC] focus:outline-none focus:border-[#D5BDB0] focus:shadow-[0_0_0_4px_rgba(213,189,176,0.15)] transition-all font-semibold"
                />
              </div>
              <div>
                <label className="text-[13px] font-bold uppercase tracking-wider text-[#B39385] block mb-2 px-1">Номер телефона</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+373 69 ..."
                  className="w-full bg-white border border-[#EDE9E3] rounded-2xl px-5 py-[18px] text-[#3E3A37] placeholder:text-[#C7C2BC] focus:outline-none focus:border-[#D5BDB0] focus:shadow-[0_0_0_4px_rgba(213,189,176,0.15)] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Расчет суммы и деталей */}
            <div className="mt-8 p-6 bg-white border border-[#EDE9E3] rounded-[24px] relative shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="absolute top-0 left-0 w-[6px] h-full bg-[#D5BDB0] rounded-l-[24px]"></div>
                <h3 className="font-bold text-[#3E3A37] text-[18px] mb-4 pl-2">Детали записи</h3>
                
                <div className="pl-2 space-y-3">
                  <div className="flex justify-between items-start text-[14px]">
                    <span className="text-[#8B857F] font-medium leading-relaxed">Услуга:</span>
                    <span className="text-[#3E3A37] font-semibold text-right max-w-[150px] leading-snug">
                      {selectedService ? services.find(s=>s.id === selectedService).name : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#8B857F] font-medium">Длина:</span>
                    <span className="text-[#3E3A37] font-semibold">{selectedLength?.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#8B857F] font-medium">Время:</span>
                    <span className="text-[#3E3A37] font-semibold">{selectedDate?.fullString}, {selectedTime}</span>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-dashed border-[#EDE9E3] flex justify-between items-center">
                    <span className="text-[#3E3A37] font-bold text-[16px]">Итого:</span>
                    <span className="text-[#3E3A37] font-extrabold text-[20px]">{totalPrice} MDL</span>
                  </div>
                </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3E3A37] font-sans pb-[100px] selection:bg-[#D5BDB0]/40">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md mx-auto p-5 pb-0"
      >
        {/* Хедер профиля */}
        <header className="flex items-center gap-4 mb-8 mt-1 cursor-default bg-white p-4 rounded-[24px] border border-[#EDE9E3] shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-[#F2EFEA] shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" 
              alt="Мастер Alina" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#3E3A37] leading-tight mb-0.5">
              Alina Nails
            </h1>
            <div className="flex items-center text-[#8B857F] text-xs font-semibold">
              <MapPin size={12} className="mr-1 text-[#D5BDB0]" />
              <span className="uppercase tracking-wider">Chisinau, Botanica</span>
            </div>
          </div>
        </header>

        {/* ProgressBar */}
        <div className="mb-10 px-2">
           <div className="flex items-center justify-between text-[11px] font-bold text-[#B39385] uppercase tracking-[0.15em] mb-3">
              <span>Шаг {currentStep} из {totalSteps}</span>
           </div>
           <div className="flex gap-1.5 h-[5px] w-full">
              {[...Array(totalSteps)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ease-out ${
                    i < currentStep ? 'bg-[#D5BDB0]' : 'bg-[#EAE4DC]'
                  }`} 
                />
              ))}
           </div>
        </div>

        {/* Контент формы с анимацией переходов */}
        <div className="overflow-hidden min-h-[460px]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* Sticky Footer Навигация */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#FAF7F2] from-50% via-[#FAF7F2]/95 to-transparent pt-16 z-50 pointer-events-none"
      >
        <div className="max-w-md mx-auto flex gap-3 pointer-events-auto">
          {currentStep > 1 && (
            <button 
              onClick={handlePrev}
              className="w-[64px] h-[64px] flex items-center justify-center rounded-[20px] bg-white border border-[#EDE9E3] text-[#3E3A37] hover:bg-[#F2EFEA] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.03)] active:scale-95 shrink-0"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          <button 
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex-1 flex flex-row items-center justify-center gap-2 h-[64px] rounded-[20px] font-bold text-[17px] tracking-wide transition-all duration-300 shadow-sm ${
              canGoNext()
                ? 'bg-[#3E3A37] text-white hover:bg-[#2D2A26] active:scale-[0.98] shadow-[0_8px_25px_rgba(62,58,55,0.2)]'
                : 'bg-[#EAE4DC] text-[#BCAEA9] cursor-not-allowed'
            }`}
          >
            {currentStep === totalSteps ? (
              `Записаться • ${totalPrice} MDL`
            ) : (
              <>Далее <ArrowRight size={18} strokeWidth={2.5} className="mt-0.5" /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
