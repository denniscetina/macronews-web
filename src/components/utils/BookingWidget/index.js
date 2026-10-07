import "./styles.css";
import BookingWidgetCalendarPicker from "./components/CalendarPicker";
import BookingWidgetGuestsRooms from "./components/GuestsRooms";
import BookingWidgetOriginBox from "./components/OriginBox";
import BookingWidgetPanel from "./components/Panel";
import BookingWidgetPromoCode from "./components/PromoCode";
import BookingWidgetRoot from "./components/Root";
import BookingWidgetSubmit from "./components/Submit";
import BookingWidgetTabs from "./components/Tabs";

export default function BookingWidget(props) {
	return <BookingWidgetRoot data-utils="BookingWidget" {...props} />;
}

BookingWidget.Root = BookingWidgetRoot;
BookingWidget.Panel = BookingWidgetPanel;
BookingWidget.Tabs = BookingWidgetTabs;
BookingWidget.CalendarPicker = BookingWidgetCalendarPicker;
BookingWidget.GuestsRooms = BookingWidgetGuestsRooms;
BookingWidget.OriginBox = BookingWidgetOriginBox;
BookingWidget.PromoCode = BookingWidgetPromoCode;
BookingWidget.Submit = BookingWidgetSubmit;
