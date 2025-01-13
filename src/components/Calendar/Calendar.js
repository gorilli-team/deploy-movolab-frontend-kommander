import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import WhiteBox from '../../components/UI/WhiteBox';
import TableHeader from '../../components/UI/TableHeader';
import { http, IS_MOBILE } from '../../utils/Utils';
import { toast } from 'react-hot-toast';
import RentalLocationRow from '../../components/Calendar/RentalLocationRow';
import CalendarRow from '../../components/Calendar/CalendarRow';
import moment from 'moment/min/moment-with-locales';
import { TextField } from '../../components/Form/TextField';
import NewEventModal from '../../components/Calendar/NewEventModal';
import Button from '../../components/UI/buttons/Button';
import FilterSelectField from '../../components/Form/FilterSelectField';
import { getVehicleGroup } from '../../utils/Vehicles';
import { UserContext } from '../../store/UserContext';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';
import ToggleSwitch from '../UI/ToggleSwitch';
import {
  FaChevronRight,
  FaChevronLeft,
  FaAnglesRight,
  FaAnglesLeft,
  FaRegCalendar,
  FaAngleDown,
} from 'react-icons/fa6';
import { hoursMapInv } from './EventSegment';
import ModalReservationUpdateCar from '../Reservations/ModalReservationUpdateCar';

moment.locale('it');

const calendarCellUnit = IS_MOBILE ? 95 : 150;

const Calendar = ({ ...props }) => {
  const now = moment().subtract(1, 'hour');

  const history = useHistory();
  const [rentalLocations, setRentalLocations] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cellsTotal, setCellsTotal] = useState(7);
  const [hoursMode, setHoursMode] = useState('24');
  const [selectedWorkflow, setSelectedWorkflow] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [newEventModal, setNewEventModal] = useState(false);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [allVehicles, setVehicles] = useState(false);
  const [mouseElementTrack, setMouseElementTrack] = useState(null);
  const [areAllExpanded, setAllExpanded] = useState(false);
  const [baseDate, setBaseDate] = useState(moment().startOf('day'));
  const [droppedEvent, setDropEvent] = useState(null);

  useEffect(() => {
    fetchWorkflows();
    fetchGroups();
  }, []); // eslint-disable-line

  useEffect(() => {
    fetchRentalLocations(selectedWorkflow?._id);
  }, [selectedWorkflow]); // eslint-disable-line

  useEffect(() => {
    fetchVehicles(true);
  }, [rentalLocations, selectedGroups, cellsTotal]); // eslint-disable-line

  useEffect(() => {
    fetchVehicles();
  }, [baseDate]); // eslint-disable-line

  const mode = window.location.pathname.split('/')[1];
  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  const calendarDisplayDates = [];
  for (let i = 0; i < cellsTotal; i++) {
    calendarDisplayDates.push(baseDate.clone().add(i, 'd'));
  }

  const parseDragDateTime = (event, refElement) => {
    const row = refElement.current.getBoundingClientRect();
    const leftPercentRow = ((event.clientX - row.left) * 100) / row.width;

    const position = (leftPercentRow * cellsTotal) / 100;
    var cellNumber = Math.floor(position);
    var hours = Math.round(24 * (position - cellNumber));

    if (cellNumber >= cellsTotal) {
      cellNumber = cellsTotal - 1;
      hours = 24;
    }

    if (!calendarDisplayDates[cellNumber]) return null;

    return calendarDisplayDates[cellNumber].clone().set({ hours: hours, minutes: 0, seconds: 0 });
  };

  var isOpenSpot = true;
  const onDragging = (e) => {
    if (mouseElementTrack) {
      const elem = mouseElementTrack.getBoundingClientRect();
      const row = mouseElementTrack.elemRef.current.getBoundingClientRect();
      const fromLeft = e.clientX - elem.left;
      const leftPercent = (fromLeft * 100) / row.width;
      const leftPercentRow = ((e.clientX - row.left) * 100) / row.width;

      if (fromLeft > 1 && leftPercentRow < 100.001) {
        mouseElementTrack.style.width = leftPercent + '%';
      }

      // Autoscroll soluzione basic
      if (e.clientX / e.view.innerWidth > 0.96) {
        scrollCalendarTo(0, 0, 10);
      }

      const dateTimeStart = mouseElementTrack.dateTimeStart;
      if (!now.isBefore(dateTimeStart)) {
        mouseElementTrack.classList.add('bg-red-600');
        mouseElementTrack.classList.add('text-red-600');
        mouseElementTrack.classList.remove('bg-sky-600');
        mouseElementTrack.innerHTML = '<div class="px-4">Data ritiro non valida</div>';
        return;
      }

      // Cambio colore alla "riga evento" che sto trascinando se mi fermo su orari di chiusura
      const dateTimeEnd = parseDragDateTime(e, mouseElementTrack.elemRef);

      if (!dateTimeEnd) return null;

      if (hoursMode === '12') {
        dateTimeEnd.set('hour', hoursMapInv[dateTimeEnd.hour()]);
      }

      const dayAvailability =
        mouseElementTrack?.eventData?.rental?.availabilityWeekTable[dateTimeEnd.isoWeekday() - 1];

      const closingDayAvailability =
        mouseElementTrack?.eventData?.rental?.availabilityClosingDays?.find((cd) =>
          dateTimeEnd.isBetween(cd.from, cd.to, 'day', '[]'),
        )
          ? true
          : false;

      if (dayAvailability[dateTimeEnd.hour()] === 0 || closingDayAvailability) {
        // Ritardo l'azione di qualche ms per evitare che lampeggi l'evento mentre passo sulle ore di chiusura
        setTimeout(() => {
          if (!isOpenSpot) {
            mouseElementTrack.classList.add('bg-red-600');
            mouseElementTrack.classList.add('text-red-600');
            mouseElementTrack.classList.remove('bg-sky-600');
            mouseElementTrack.classList.remove('text-sky-600');
            mouseElementTrack.innerHTML = '<div class="px-4">Punto nolo chiuso</div>';
          }
        }, 250);
        isOpenSpot = false;
      } else {
        mouseElementTrack.classList.add('bg-sky-600');
        mouseElementTrack.classList.add('text-sky-600');
        mouseElementTrack.classList.remove('bg-red-600');
        mouseElementTrack.classList.remove('text-red-600');
        mouseElementTrack.innerHTML =
          '<div class="px-4">' +
          dateTimeStart.format('D MMM, HH:mm') +
          ' - ' +
          dateTimeEnd.format('D MMM, HH:mm') +
          '</div>';
        isOpenSpot = true;
      }
    }
  };

  const onDragEnd = (e) => {
    if (mouseElementTrack) {
      const dateTimeEnd = parseDragDateTime(e, mouseElementTrack.elemRef);
      const dateTimeStart = mouseElementTrack.dateTimeStart;

      if (hoursMode === '12') {
        dateTimeEnd.set('hour', hoursMapInv[dateTimeEnd.hour()]);
      }

      if (!(dateTimeStart && dateTimeEnd)) {
        cancelDrag();
        return;
      }

      if (
        dateTimeEnd.isSame(dateTimeStart) ||
        now.isAfter(dateTimeStart) ||
        dateTimeStart.isAfter(dateTimeEnd)
      ) {
        cancelDrag();
        return;
      }

      const dayAvailability =
        mouseElementTrack.eventData.rental.availabilityWeekTable[dateTimeEnd.isoWeekday() - 1];

      const closingDayAvailability =
        mouseElementTrack.eventData?.rental?.availabilityClosingDays?.find((cd) =>
          dateTimeEnd.isBetween(cd.from, cd.to, 'day', '[]'),
        )
          ? true
          : false;

      if (dayAvailability[dateTimeEnd.hour()] === 0 || closingDayAvailability) {
        cancelDrag();
        return;
      }

      setNewEventModal(
        <NewEventModal
          eventData={mouseElementTrack.eventData}
          canOpenMovo={mouseElementTrack.isMovoTime}
          dateTimeStart={dateTimeStart}
          dateTimeEnd={dateTimeEnd}
          calendarFilters={{ selectedWorkflow, selectedGroups }}
          onClose={(savedData = false, type = '') => {
            setNewEventModal(false);
            mouseElementTrack.remove();
            if (savedData) {
              if (type === 'rent') {
                history.push(`/${mode}/movimenti/crea/2/${savedData.rent._id}`);
              } else if (type === 'reservation') {
                history.push(`/${mode}/prenotazioni/${savedData.updatedReservation._id}`);
              } else {
                fetchVehicles();
              }
            }
          }}
        />,
      );
    }
    setMouseElementTrack(false);
  };

  const onDragStart = (e, eventData, ref) => {
    const dateTimeStart = parseDragDateTime(e, ref);

    if (hoursMode === '12') {
      dateTimeStart.set('hour', hoursMapInv[dateTimeStart.hour()]);
    }

    const dayAvailability =
      eventData?.rental?.availabilityWeekTable[dateTimeStart.isoWeekday() - 1];

    const closingDayAvailability = eventData?.rental?.availabilityClosingDays?.find((cd) =>
      dateTimeStart.isBetween(cd.from, cd.to, 'day', '[]'),
    )
      ? true
      : false;

    if (
      hoursMode !== '12' &&
      (dayAvailability[dateTimeStart.hour()] === 0 || closingDayAvailability)
    ) {
      return;
    }

    const row = ref.current.getBoundingClientRect();
    // const fromLeft = e.clientX - elem.left;
    const leftPercent = ((e.clientX - row.left) * 100) / row.width;

    const eventNode = document.createElement('div');
    eventNode.className =
      'absolute h-8 top-2 md:h-10 md:top-3 cursor-pointer bg-sky-600 bg-opacity-30 z-[1] rounded-lg flex items-center font-medium overflow-hidden';
    eventNode.style.left = leftPercent + '%';
    eventNode.style.textWrap = 'nowrap';
    eventNode.style.width = '0';
    eventNode.elemRef = ref;
    eventNode.dateTimeStart = dateTimeStart;
    eventNode.eventData = eventData;

    const hourNow = dateTimeStart.isSame(now, 'date') ? moment().hour() : 24;
    eventNode.isMovoTime =
      hourNow < 24 && Math.floor(dateTimeStart.hour() / 6) === Math.floor(hourNow / 6);

    ref.current.appendChild(eventNode);
    setMouseElementTrack(eventNode);
  };

  const cancelDrag = () => {
    if (mouseElementTrack) {
      mouseElementTrack.remove();
    }
    setMouseElementTrack(false);
  };

  const fetchRentalLocations = async (workflowId) => {
    try {
      if (mode === 'corporate') {
        if (workflowId) {
          setRentalLocations(selectedWorkflow.rentalLocations);
        }

        return;
      }

      const response = await http({
        url: '/clients/rentalLocation/enabled' + (workflowId ? `?workflow=${workflowId}` : ''),
      });

      setRentalLocations(response.rentalLocations);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchVehicles = async (loading = false) => {
    if (!rentalLocations) {
      return;
    }

    const endDate = baseDate.clone().add(cellsTotal, 'days');
    const vehicles = [];

    setIsLoading(loading);

    for (const rental of rentalLocations) {
      const locationEvents = await http({
        url: `${mode === 'corporate' ? '/corporate' : ''}/calendar/eventsByRentalLocation/${
          rental._id
        }?startDate=${baseDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`,
      });

      vehicles[rental._id] = locationEvents.vehicleEvents.filter(
        (item) =>
          // item.enabled && TODO: Check if vehicle is enabled!
          !selectedGroups.length ||
          selectedGroups.filter((e) => e.value === getVehicleGroup(item).group?._id).length > 0,
      );
    }

    setIsLoading(false);
    setVehicles(vehicles);
  };

  const fetchWorkflows = async () => {
    try {
      const response = await http({ url: `/workflow/active?initiator=${mode}` });

      setWorkflows(response.workflows.map((wf) => ({ value: wf._id, label: wf.name, ...wf })));

      if (mode === 'corporate') {
        const rentals = [];
        response.workflows.forEach((wf) => rentals.push(...wf.rentalLocations));
        setRentalLocations(rentals);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await http({ url: '/groups' });
      setGroups(
        response.groups.map((group) => {
          return { value: group?._id, label: `${group?.mnemonic} - ${group?.description}` };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const calNav = (op = 'next', unit = false, value = 1, weekday = false, startOfDay = true) => {
    if (unit === false) {
      unit = 'day';
      value = cellsTotal;
    }

    const date =
      op === 'next'
        ? baseDate.clone().add(value, unit)
        : op === 'prev'
        ? baseDate.clone().subtract(value, unit)
        : baseDate;

    if (weekday !== false) {
      date.weekday(weekday);
    }
    if (startOfDay !== false) {
      date.startOf('day');
    }
    setBaseDate(date);
    scrollCalendarTo(0);
  };

  const scrollCalendarTo = (px, target = false, addpx = false) => {
    for (const el of document.getElementsByClassName('calendarScroll')) {
      if (el !== target) {
        if (addpx) {
          el.scrollLeft += addpx;
        } else {
          el.scrollLeft = px;
        }
      }
    }
  };

  // Sincronizzazione delle scrollbars
  const onScroll = (e) => scrollCalendarTo(e.target.scrollLeft, e.target);

  document.onmouseup = onDragEnd;
  document.onmousemove = onDragging;
  document.ontouchend = (e) => {
    e.clientX = e.changedTouches[e.changedTouches.length - 1].clientX;
    onDragEnd(e);
  };
  document.ontouchmove = (e) => {
    e.clientX = e.touches[0].clientX;
    onDragging(e);
  };

  const cities = rentalLocations
    .map((rental) => rental.city)
    .filter((item, pos, self) => self.indexOf(item) === pos)
    .map((rental) => ({ value: rental, label: rental }));

  const preFilteredRentals = rentalLocations.filter(
    (rental) => allVehicles?.[rental._id]?.length > 0,
  );

  return (
    <>
      <WhiteBox hideOverflow={false} {...props}>
        <TableHeader
          tableName="Calendario"
          className="pb-0 justify-between flex-wrap gap-y-2 relative"
        >
          <div className="flex font-medium text-lg">
            {baseDate.format('D MMMM YYYY')} -{' '}
            {baseDate
              .clone()
              .add(cellsTotal - 1, 'day')
              .format('D MMMM YYYY')}
          </div>
          <div className="w-32 text-right absolute md:static top-6 right-6">
            <button
              className="text-xs opacity-70 hover:opacity-100"
              onClick={() => setAllExpanded(!areAllExpanded)}
            >
              {areAllExpanded ? 'Chiudi' : 'Espandi'} tutti{' '}
              <FaAngleDown className={`inline mb-1 ${areAllExpanded && 'transform rotate-180'}`} />
            </button>
          </div>
        </TableHeader>

        <div className="sticky top-0 z-10 bg-white">
          <div className="flex flex-wrap gap-y-2 p-4 md:p-6 justify-between">
            <div className="flex mr-2">
              <Button
                btnStyle="whiteLightButton"
                className="text-slate-500 rounded-r-none border-r-0"
                title="Periodo precedente"
                onClick={() => calNav('prev')}
                disabled={isLoading}
              >
                <FaAnglesLeft />
              </Button>
              <Button
                btnStyle="whiteLightButton"
                className="text-slate-500 rounded-none border-r-0"
                title="Giorno precedente"
                onClick={() => calNav('prev', 'day')}
                disabled={isLoading}
              >
                <FaChevronLeft className="text-xs" />
              </Button>
              <Button
                btnStyle="whiteLightButton"
                className="text-slate-500 rounded-none border-r-0 text-sm"
                title="Vai a oggi"
                onClick={() => {
                  setBaseDate(moment().startOf('day'));
                  scrollCalendarTo(0);
                }}
                disabled={isLoading}
              >
                Oggi
              </Button>
              <Button
                btnStyle="whiteLightButton"
                className="text-slate-500 rounded-none border-r-0"
                title="Giorno successivo"
                onClick={() => calNav('next', 'day')}
                disabled={isLoading}
              >
                <FaChevronRight className="text-xs" />
              </Button>
              <Button
                btnStyle="whiteLightButton"
                className="text-slate-500 rounded-l-none"
                title="Periodo successivo"
                onClick={() => calNav('next')}
                disabled={isLoading}
              >
                <FaAnglesRight />
              </Button>

              <Button
                btnStyle="whiteLightButton"
                className={`text-slate-500 ${showDateSelect && 'rounded-r-none border-r-0'} ml-2`}
                onClick={() => {
                  setShowDateSelect(!showDateSelect);
                }}
                title="Scegli giorno dal calendario"
                disabled={isLoading}
              >
                <FaRegCalendar />
              </Button>
              {showDateSelect ? (
                <TextField
                  type="date"
                  className="mb-0 h-full"
                  inputGroupClassName="h-full"
                  placeholder=" "
                  startValue={baseDate.format('YYYY-MM-DD')}
                  onChangeFunction={(e) => setBaseDate(moment(e.target.value).startOf('day'))}
                  inputClassName="text-slate-500 !border-slate-300 rounded-r-lg rounded-l-none text-sm !py-0 h-full"
                />
              ) : (
                ''
              )}
              <ToggleSwitch
                className="mt-1 ml-2"
                switches={[
                  {
                    label: '24h',
                    selected: hoursMode === '24',
                    onClick: () => setHoursMode('24'),
                  },
                  {
                    label: '12h',
                    selected: hoursMode === '12',
                    onClick: () => setHoursMode('12'),
                  },
                ]}
              />
            </div>

            <div className="flex gap-2 flex-1 justify-end">
              <FilterSelectField
                onChange={(sel) => setSelectedWorkflow(sel.value ? sel : null)}
                emptyOption={{ label: 'Tutti i flussi' }}
                options={workflows}
                className="w-1/2 md:w-auto"
                minW="md:min-w-[12rem]"
                altSelect
              />
              <FilterSelectField
                onChange={(sel) => setSelectedGroups(sel)}
                emptyOption={{ label: 'Tutti i gruppi' }}
                options={groups}
                className="w-1/2 md:w-auto"
                minW="md:min-w-[12rem]"
                isMulti
              />
              {mode === 'corporate' ? (
                <FilterSelectField
                  onChange={(sel) => setSelectedCity(sel.value ? sel : null)}
                  emptyOption={{ label: 'Tutti i comuni' }}
                  options={cities}
                  className="w-1/2 md:w-auto"
                  minW="md:min-w-[12rem]"
                  altSelect
                />
              ) : null}
            </div>
          </div>

          <div className="overflow-auto scrollbar-hide calendarScroll" onScroll={onScroll}>
            <div
              className="flex flex-col items-stretch w-full border-t border-slate-200 bg-gray-50"
              style={{ minWidth: 250 + calendarCellUnit * calendarDisplayDates.length + 'px' }}
            >
              <CalendarRow
                displayDates={calendarDisplayDates}
                hoursMode={hoursMode}
                isHeader={true}
              >
                <div className="flex items-center h-full">
                  <FilterSelectField
                    onChange={(e) => setCellsTotal(e.target.value)}
                    minW=""
                    options={[
                      { value: '7', label: 'Settimana' },
                      { value: '15', label: '15 giorni' },
                      { value: '30', label: 'Mese' },
                    ]}
                    className="!w-full font-medium border border-sky-600 text-sky-600"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'%3e%3cpath d='M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z'/%3e%3c/svg%3e\")",
                    }}
                  />
                </div>
              </CalendarRow>
            </div>
          </div>
        </div>

        <div className="relative">
          {rentalLocations !== false ? (
            rentalLocations.length === 0 ? (
              <div className="px-5 py-3 bg-slate-200 relative border-white border-t-2 font-semibold">
                Nessun punto nolo per questo Flusso.
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="w-full h-full absolute top-0 left-0 z-10 bg-slate-800 bg-opacity-10 flex items-center justify-center">
                    <div className="w-24 h-24">
                      <LoadingSpinner />
                      <span className="sr-only">Carico...</span>
                    </div>
                  </div>
                )}

                {(selectedCity
                  ? preFilteredRentals.filter((rental) => rental.city === selectedCity?.value)
                  : preFilteredRentals
                ).map((rentalLocation, index) => (
                  <RentalLocationRow
                    rowsProps={{
                      displayDates: calendarDisplayDates,
                      onDragStart: onDragStart,
                      hoursMode: hoursMode,
                    }}
                    rental={rentalLocation}
                    vehicles={allVehicles[rentalLocation._id] ?? []}
                    userCompany={userData.userCompany || undefined}
                    isInit={!isLoading}
                    onScroll={onScroll}
                    startOpen={index === 0}
                    isOpen={areAllExpanded}
                    key={index}
                    pathname={mode}
                    calendarCellUnit={calendarCellUnit}
                    setDropEvent={setDropEvent}
                  />
                ))}
              </>
            )
          ) : (
            ''
          )}
        </div>

        <div className="w-full py-4"></div>
      </WhiteBox>

      {newEventModal || ''}

      <ModalReservationUpdateCar 
        showModal={droppedEvent}
        updateShowModal={() => setDropEvent(null)}
        closeShowModalAndUpdate={() => {
          setDropEvent(null)
          fetchVehicles();
        }}
        reservationData={droppedEvent?.eventData}
        useVehicle={droppedEvent?.vehicle}
      />
    </>
  );
};

export default Calendar;
