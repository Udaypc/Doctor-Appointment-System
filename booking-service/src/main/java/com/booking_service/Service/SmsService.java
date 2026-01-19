package com.booking_service.Service;

import com.twilio.rest.api.v2010.account.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.type.PhoneNumber;
@Service
public class SmsService {

    @Value("${twilio.phone.number}")
    private String fromNumber;

    public String sendSms(String to, String messageBody) {
        Message message = Message.creator(
                new PhoneNumber(to),
                new PhoneNumber(fromNumber),
                messageBody
        ).create();
        return message.getSid();
    }
}
