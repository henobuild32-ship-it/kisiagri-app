import React from "react";
import { AFRICAN_COUNTRIES, countryFlag } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { t } from "@/lib/i18n";

export default function CountryPhoneSelect({ countryDial, onCountryChange, phone, onPhoneChange }) {
  const selectedCountry = AFRICAN_COUNTRIES.find(c => c.dial === countryDial) || AFRICAN_COUNTRIES[0];

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">{t("phone_number")}</Label>
      <div className="flex gap-2">
        <Select value={countryDial} onValueChange={onCountryChange}>
          <SelectTrigger className="w-36 rounded-xl h-12 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="text-lg leading-none">{countryFlag(selectedCountry.code)}</span>
              <span className="text-sm font-medium">{countryDial}</span>
            </span>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {AFRICAN_COUNTRIES.map(c => (
              <SelectItem key={c.code} value={c.dial}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{countryFlag(c.code)}</span>
                  <span>{c.name}</span>
                  <span className="text-muted-foreground ml-auto text-xs">{c.dial}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          className="flex-1 h-12 rounded-xl"
          placeholder="999 000 000"
          required
        />
      </div>
    </div>
  );
}